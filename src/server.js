import express from 'express'
import { resolve } from 'path'
import { getInfo } from 'ytdl-core'
import ytSearch from 'yt-search'
const app = express()
const root = resolve(__dirname + '/../')

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
    const lang = getLang(req)
    res.sendFile(root + `/public/${lang}/index.html`)
})

app.get(/\.(js|css)$/, function (req, res) {
    res.sendFile(root + '/public' + req.path)
})

app.get('/api/info', function (req, res) {
    const id = req.query.id

    getInfo(id).then(function (info) {
        res.json(info)
    }).catch(function (err) {
        console.log(err + '')
        res.status(400)
        res.json({
            error: err.toString().replace(/^Error(?::\s*)/, '')
        })
    })
})

app.get('/api/search', function (req, res) {
    const q = req.query.q || ''
    const page = req.query.page || 1;

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
            return;
        }
        
        res.json({
            query: q,
            page: page,
            vids: results.videos.map(v => {
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                delete v.url
                return v
            })
        })
    })
})

app.get('/:id', function (req, res) {
    const lang = getLang(req)
    res.sendFile(root + `/public/${lang}/pageview.html`)
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

    if (supported.includes(qLang)) { return qLang; }
    if (browser) return browser
    return 'en'
}
