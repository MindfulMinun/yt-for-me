import express from 'express'
import path from 'path'
import ytSearch from 'yt-search'
import mustacheExpress from 'mustache-express'
import { getLang } from './serverHelpers'

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
    const page = Math.max(1, req.query.page || 1)
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
                errCode: 0x0042,
                vids: []
            }))
            return
        }
        
        res.render(root + '/public/search.mst', Object.assign(render, {
            vids: results.videos.filter(e => e.videoId !== 'L&ai').map((v, i) => {
                v.index = i // for mustashe lol
                v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                v.ago = v.ago.replace('Streamed ', '')
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

app.get('/:id([a-zA-Z0-9_-]{11})', function (req, res) {
    const lang = getLang(req)
    const q = req.query.q || ''
    res.render(root + `/public/video.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`),
        query: q
    })
})

app.use('/api', require('./api').default)

// Handle 404s
app.use(function (req, res, next) {
    res.status(404)

    // if (req.accepts('html')) {
    //     res.render('404', { url: req.url })
    //     return
    // }
    if (req.accepts('json')) {
        res.send({
            error: 'Not found',
            errCode: 0x0012
        })
        return
    }
    // Plain text default
    res.type('txt').send('Not found')
})

// Handle 500s
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send({
        error: 'Server error',
        errCode: 0x0051
    })
})

app.listen(process.env.PORT || 8080, function () {
    console.log(`Server is live`)
})
