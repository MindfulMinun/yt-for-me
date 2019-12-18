import express from 'express'
import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import ytSearch from 'yt-search'
import ffmpeg from 'fluent-ffmpeg'
import mustacheExpress from 'mustache-express'
import uuid from 'uuid/v4'

// Make the Express server
const app = express()
const root = path.resolve(__dirname + '/../')

// Constants
const acceptedFormats = [
    'mp3',
    'acc',
    'ogg',
    'mp4',
    'mov',
    'mpeg',
    'webm'
]

// Load POST requests as JSON
app.use(express.json())
// Use Mustache
app.engine('mst', mustacheExpress(__dirname + '/public', '.mst'))
app.set('view engine', 'mustache')

app.get('/', function (req, res) {
    const lang = getLang(req)
    res.render(`${root}/public/index.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`)
    })
})

app.get('/node_modules/:path([\\s\\S]*)', function (req, res) {
    const p = path.resolve(root + '/node_modules/' + req.params.path)
    res.sendFile(p)
})

app.get('/js/:path([\\s\\S]*)', function (req, res) {
    const p = path.resolve(root + '/dist/' + req.params.path)
    res.sendFile(p)
})

app.get('/css/:path([\\s\\S]*)', function (req, res) {
    const p = path.resolve(root + '/public/' + req.params.path)
    res.sendFile(p)
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
            vids: results.videos.filter(e => e.id !== 'L&ai').map((v, i) => {
                v.index = i // for mustashe lol
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                delete v.url
                return v
            })
        }))
    })
})

app.get('/yt-downloads/:vid', function (req, res) {
    res.sendFile(
        path.resolve(`${root}/yt-downloads/${req.params.vid}`)
    )
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

app.get(function (req, res) {
    console.log('default')
    res.sendFile(root + '/../' + req.path)
})

// Keep track of video progresses
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

app.get('/api/progress/:id', function (req, res) {
    res.json(
        progresses[req.params.id] || {
            error: 'Progress not found. Probably bootstrapping?'
        }
    )
})

/**
 * POST /download
 * Makes the server download a video (pog)
 * POST:
 *     id: The ytid of the video (obviously)
 *     videoItag: The itag of the video file
 *     audioItag: The itag of the audio file
 *     outFormat: The format of the output file
 * 
 * 200 OK:
 *     JSON, the vids property returns results provided by ytSearch.
 * 400 Bad request
 *     error: The error property describes the error
 * 500 Internal Server Error
 *     error: The error property describes the error
 */
app.post('/api/download', function (req, res) {
    const id = req.body.id || ''
    if (!ytdl.validateID(id)) {
        res.status(400)
        res.json({
            error: "Assertion failed, ID invalid"
        })
        return
    }
    
    const { videoItag, audioItag, outFormat } = req.body

    if (acceptedFormats.indexOf(req.body.outFormat) === -1) {
        res.status(400)
        res.json({
            error: "outFormat is not an accepted format"
        })
        return
    }
    
    // Use this uuid to identify downloads.
    const dlid = uuid()

    const video = videoItag === 'none' ? null : ytdlSave(id, dlid, videoItag)
    const audio = audioItag === 'none' ? null : ytdlSave(id, dlid, audioItag)

    if (!(video || audio)) {
        res.status(400)
        res.json({
            error: "No input files to work with"
        })
        return
    }

    progresses[dlid] = {
        started: true
    }

    res.json({
        dlid: dlid,
        poll: `/api/progress/${dlid}`
    })

    Promise.allSettled([video, audio]).then(function (results) {
        console.log('Download finished, joining with ffmpeg')
        const outFileName = `${dlid}.${req.body.outFormat}`
        const both = path.resolve(`${root}/yt-downloads/${outFileName}`)
        const command = ffmpeg()

        command.on('progress', function (progress) {
            progresses[dlid].merge = (progresses[dlid].merge || {})
            progresses[dlid].merge = {
                finished: false,
                progress: progress.percent / 100
            }
        })
        command.on('end', function () {
            console.log('Merge finished!')
            progresses[dlid].url = `/yt-downloads/${outFileName}`
        })
        command.on('error', function (e) {
            console.log(e)
            res.status(500)
            res.json({
                error: e.toString() || "An unexpected error occurred"
            })
        })

        if (video) {
            command.input(results[0].value.output)
                //    .videoCodec(results[0].value.codec)
        }
        if (audio) {
            command.input(results[1].value.output)
                //    .audioCodec(results[1].value.codec)
        }

        command.format(outFormat)
            .inputOptions('-strict experimental')
            .save(both)
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
 * @version 0.1.0
 */
function getLang(req) {
    const supported = ['en-US', 'es-US', 'x-dummy']
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
 * @version 0.1.0
 */
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Decaffeinate-style guard
 * @param {*} what - The thing that might be null or undefined
 * @param {function} mod - The modifier
 * @returns {*} The return value of your function or undefined if nullish
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 0.1.0
 */
function guard(what, mod) {
    return (typeof what !== 'undefined' && what !== null) ? mod(what) : void 0
}

function ytdlSave(id, dlid, itag) {
    return new Promise(function (resolve, reject) {
        let output = `${root}/yt-downloads/${dlid}-${itag}.`
        // fs.access(output, fs.constants.F_OK, function (err) {
            
        // })

        let writeStream
        let codec
        const stream = ytdl(id, {
            quality: itag
        }).on('info', function (e) {
            progresses[dlid][itag] || (progresses[dlid][itag] = {})
            progresses[dlid][itag].finished = false
            progresses[dlid][itag].progress = 0
            codec = guard(
                e.formats.filter(a => a.itag === itag)[0],
                f => f.audioEncoding || f.encoding
            )

            // Before writing to the output stream, we gotta get the container lol
            // So we call ytdl before we know the container to get it, then pipe it to the output
            output += guard(
                e.formats.filter(a => a.itag === itag)[0],
                f => f.container
            )

            writeStream = fs.createWriteStream(path.resolve(output))
            stream.pipe(writeStream)
            
        }).on('finish', function () {
            progresses[dlid] || (progresses[dlid] = {})
            progresses[dlid][itag].finished = true
            // Resolve with the output and the codec, not the WritableStream
            resolve({output, codec})
        }).on('progress', function (a, b, c) {
            // Save the progression on the progresses object
            progresses[dlid][itag] || (progresses[dlid][itag] = {})
            progresses[dlid][itag].progress = b / c
            // console.log(progresses[dlid])
        }).on('error', reject)
    })
}

// All settled polyfill
if (!Promise.allSettled) {
    Promise.allSettled = promises => Promise.all(
        promises.map((promise, ) => {
            promise = promise || Promise.reject()

            return promise.then(value => ({
                status: "fulfilled",
                value,
            }))
            .catch(reason => ({
                status: "rejected",
                reason,
            }))
        })
    )
}
