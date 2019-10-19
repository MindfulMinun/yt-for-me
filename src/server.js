import express from 'express'
import { resolve } from 'path'
import { getInfo } from 'ytdl-core'
const app = express()
const root = resolve(__dirname + "/../")

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
    res.sendFile(root + '/public/index.html');
});

app.get(/\.(js|css)$/, function (req, res) {
    res.sendFile(root + '/public' + req.path);
})

app.get('/:id', function (req, res) {
    res.sendFile(root + '/public/index.html');
})

app.get('/info/:id', function (req, res) {
    const id = req.params.id

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

app.listen(process.env.PORT || 8080, function () {
    console.log('Server is live')
})
