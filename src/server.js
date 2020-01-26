import express from 'express'
import path from 'path'
import url from 'url'
import compression from 'compression'
import ytSearch from 'yt-search'
import mustacheExpress from 'mustache-express'
import { getLang } from './serverHelpers'

// Make the Express server
const app = express()
const rootPath = path.resolve(__dirname + '/../')

// Load POST requests as JSON
app.use(express.json())
// gzip *everything*
app.use(compression())
// Use Mustache
app.engine('mst', mustacheExpress(rootPath + '/public', '.mst'))
app.set('view engine', 'mustache')

app.get('/', function (req, res) {
    const lang = getLang(req)
    res.render(`${rootPath}/public/index.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`)
    })
})

app.use(express.static(rootPath + '/public'))
app.use('/node_modules', express.static(rootPath + '/node_modules'))
app.use('/js', express.static(rootPath + '/dist'))
app.use('/css', express.static(rootPath + '/public'))

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

    res.render(rootPath + '/public/search.mst', render)
})

app.get('/:id([a-zA-Z0-9_-]{11})', function (req, res) {
    res.redirect(url.format({
        pathname: "/video",
        query: {
            ...req.query,
            v: req.params.id
        }
    }))
})

app.get('/video', function (req, res) {
    const lang = getLang(req)
    res.render(rootPath + `/public/video.mst`, {
        lang: lang,
        d: require(`./langs/${lang}.js`),
        query: req.query.q || ''
    })
})

app.use('/api', require('./api').default)

// Handle 500s
app.use(function (err, req, res, next) {
    if (/no such file or directory/i.test(err)) {
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
        return
    }

    res.status(500).send({
        // error: 'Server error',
        error: err.toString(),
        errCode: 0x0050
    })
})

app.listen(process.env.PORT || 8080, function () {
    console.log(`Server is live`)
})
