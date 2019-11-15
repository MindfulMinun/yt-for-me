import express from 'express'
import { resolve } from 'path'
import { getInfo } from 'ytdl-core'
import ytSearch from 'yt-search'
import mustacheExpress from 'mustache-express'
const app = express()
const root = resolve(__dirname + '/../')

app.use(require('cookie-parser')())
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

    ytSearch({
        query: q,
        pageStart: page,
        pageEnd: page + 1
    }, function (err, results) {
        if (err) {
            res.status(400)
            res.render(root + '/public/search.mst', {
                error: err.toString().replace(/^Error(?::\s*)/, ''),
                lang: lang,
                d: require(`./langs/${lang}.js`),
                query: q,
                page: page,
                vids: []
            })
            return
        }
        
        res.render(root + '/public/search.mst', {
            lang: lang,
            d: require(`./langs/${lang}.js`),
            query: q,
            page: page,
            vids: results.videos.map((v, i) => {
                v.index = i // for mustashe lol
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                delete v.url
                return v
            })
        })
    })
})

app.get('/:id', function (req, res) {
    const lang = getLang(req)
    res.render(root + `/public/pageview.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`)
    })
})

app.get('/api/info', function (req, res) {
    const id = req.query.id

    getInfo(id).then(function (info) {
        res.json(info)
    }).catch(function (err) {
        res.status(400)
        res.json({
            error: err.toString().replace(/^Error(?::\s*)/, '')
        })
    })
})

app.get('/api/search', function (req, res) {
    const q = req.query.q || ''
    const page = req.query.page || 1

    ytSearch({
        query: q,
        pageStart: page,
        pageEnd: page + 1
    }, function (err, results) {
        if (err) {
            res.status(400)
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

app.listen(process.env.PORT || 8080, function () {
    console.log('Server is live')
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
    const supported = ['en', 'es']
    const qLang = (req.query.lang || '').slice(0, 2)
    const browser = req.acceptsLanguages(supported)

    if (supported.includes(qLang)) { return qLang }
    if (browser) return browser
    return 'en'
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
