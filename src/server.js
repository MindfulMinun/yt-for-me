import express from 'express'
import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import ytSearch from 'yt-search'
import ffmpeg from 'fluent-ffmpeg'
import mustacheExpress from 'mustache-express'
const app = express()
const root = path.resolve(__dirname + '/../')

app.use(require('cookie-parser')())
app.use(express.json())
app.engine('mst', mustacheExpress(__dirname + '/public', '.mst'))
app.set('view engine', 'mustache')

app.get('/', function (req, res) {
    const lang = getLang(req)
    res.render(`${root}/public/index.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`)
    })
})

app.get(/\.js$/, function (req, res) {
    res.sendFile(root + '/dist' + req.path)
})

app.get(/\.css$/, function (req, res) {
    res.sendFile(root + '/public' + req.path)
})

app.get('/search', function (req, res) {
    const q = req.query.q || ''
    const page = req.query.page || 1
    const lang = getLang(req)
    const render = {
        lang: lang,
        d: require(`./langs/${lang}.js`),
        query: q,
        page: page
    }

    if (q.trim().length === 0) {
        res.render(root + '/public/search.mst', Object.assign(render, {
            vids: []
        }))
        return
    }

    ytSearch({
        query: q,
        pageStart: page,
        pageEnd: page + 1
    }, function (err, results) {
        if (err) {
            res.status(400)
            res.render(root + '/public/search.mst', Object.assign(render, {
                error: err.toString().replace(/^Error(?::\s*)/, ''),
                vids: []
            }))
            return
        }
        
        res.render(root + '/public/search.mst', Object.assign(render, {
            vids: results.videos.map((v, i) => {
                v.index = i // for mustashe lol
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                delete v.url
                return v
            })
        }))
    })
})

app.get('/:id', function (req, res) {
    const lang = getLang(req)
    const q = req.query.q || ''
    res.render(root + `/public/pageview.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`),
        query: q
    })
})

// Keep track of video progresses lol
const progresses = {}

/**
 * GET /info
 * Request query parameters:
 *     id: The YouTube ID of the video in question
 * 
 * 200 OK:
 *     JSON of video metadata provided by ytdl-core
 * 500 Internal Server Error
 *     The error property describes the error
 */
app.get('/api/info', function (req, res) {
    const lang = getLang(req)
    const id = req.query.id

    ytdl.getInfo(id, { lang }).then(function (info) {
        res.json(info)
    }).catch(function (err) {
        res.status(500)
        res.json({
            error: err.toString().replace(/^Error(?::\s*)/, '')
        })
    })
})

/**
 * GET /search
 * Request query parameters:
 *     q: The search query
 *     page: The search page results number. Starts at 1, can be omitted.
 * 
 * 200 OK:
 *     JSON, the vids property returns results provided by ytSearch.
 * 500 Internal Server Error
 *     The error property describes the error
 */
app.get('/api/search', function (req, res) {
    const q = req.query.q || ''
    const page = req.query.page || 0

    ytSearch({
        query: q,
        pageStart: page,
        pageEnd: page + 1
    }, function (err, results) {
        if (err) {
            res.status(500)
            res.json({
                error: err.toString().replace(/^Error(?::\s*)/, '')
            })
            return
        }
        
        res.json({
            query: q,
            page: page,
            vids: results.videos.map((v, i) => {
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                delete v.url
                return v
            })
        })
    })
})

/**
 * GET /search
 * Request query parameters:
 *     q: The search query
 *     page: The search page results number. Starts at 1, can be omitted.
 * 
 * 200 OK:
 *     JSON, the vids property returns results provided by ytSearch.
 * 500 Internal Server Error
 *     The error property describes the error
 */
app.post('/api/download', function (req, res) {
    console.log(req.body)
    const id = req.body.id || ''
    if (!ytdl.validateID(id)) {
        res.status(400)
        res.json({
            error: "Assertion failed, ID invalid"
        })
        return
    }

    const video = ytdlSave(id, 'video')
    const audio = ytdlSave(id, 'audio')

    res.status(200)
    res.send('OK')

    Promise.allSettled([video, audio]).then(function (results) {
        console.log('Download finished, joining with ffmpeg')
        const both = path.resolve(`${root}/yt-downloads/${id}-both.webm`);

        // ffmpeg -i id-video.webm -i id-audio.webm -c:v copy -c:a aac -strict experimental id-both.mp4
        ffmpeg()
            .input(results[0].value)
            .videoCodec('copy')
            .input(results[1].value)
            .audioCodec('aac')
            .format('mp4')
            .inputOptions('-strict experimental')
            .save(both)
            .on('end', function () {
                console.log('Merge finished!')
            })
            .on('error', console.log)
    })

})

app.listen(process.env.PORT || 8080, function () {
    console.log(`Server is live`)
})


/**
 * Returns a supported language
 * @param {Request} req - The request lol
 * @returns {string} A supported language
 * @author MindfulMinun
 * @since Oct 19, 2019
 * @version 1.0.0
 */
function getLang(req) {
    const supported = ['en-US', 'es-US']
    const qLang = (req.query.lang || '')
    const browser = req.acceptsLanguages(supported)

    if (supported.includes(qLang)) { return qLang }
    if (browser) return browser
    return 'en-US'
}

/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function ytdlSave(id, kind) {
    return new Promise(function (resolve, reject) {
        const output = path.resolve(`${root}/yt-downloads/${id}-${kind}.webm`)
        const writeStream = fs.createWriteStream(output)
        ytdl(id, {
            quality: ['highestvideo', 'highestaudio'][
                ['video', 'audio'].indexOf(kind)
            ]
        })
            .on('info', function () {
                progresses[id] || (progresses[id] = {})
                progresses[id][kind] || (progresses[id][kind] = {})
                progresses[id][kind].isFinished = false
                progresses[id][kind].progress = 0
                
            })
            .on('finish', function () {
                progresses[id] || (progresses[id] = {})
                progresses[id][kind].isFinished = true
                // Resolve with the output, not the WritableStream
                resolve(output)
            })
            .on('progress', function (a, b, c) {
                // Save the progression on the progresses object
                progresses[id][kind] || (progresses[id][kind] = {})
                progresses[id][kind].progress = b / c
                console.log(progresses[id])
            })
            .on('error', reject)
            .pipe(writeStream)
    })
}

// All settled polyfill
if (!Promise.allSettled) {
    Promise.allSettled = promises => Promise.all(
        promises.map((promise,) =>
            promise
            .then(value => ({
                status: "fulfilled",
                value,
            }))
            .catch(reason => ({
                status: "rejected",
                reason,
            }))
        )
    );
}
