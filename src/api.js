import express from 'express'
import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ytSearch from 'yt-search'
import uuid from 'uuid/v4'
import fetch from 'node-fetch'
import { getLang, guard, safeLookup } from './serverHelpers'

const rootPath = path.resolve(__dirname + '/../')

const acceptedFormats = [
    'mp3',
    'acc',
    'ogg',
    'mp4',
    'mov',
    'mpeg',
    'webm'
]

/** @type express.Router */
const api = new express.Router()

const allowCorsOn = [
    // Requests from localhost to localhost are exempt from CORS
    'https://yt.benjic.xyz',
    'https://yt-for-me.herokuapp.com'
]

if (process.env.NODE_ENV !== 'production') {
    allowCorsOn.push('http://localhost')
}

// Used to keep track of video download/conversion progress
const progresses = {}

// Only let certain domains access the API
api.use(function (req, res, next) {
    const origin = allowCorsOn.find(
        host => (host === req.get('origin')) || (req.get('referer') || '').startsWith(host) 
    )

    res.set({
        'Access-Control-Allow-Origin': origin || allowCorsOn[0]
    })

    if (!origin) {
        res.send({
            // X-request
            errCode: 0x0103
        })
        return
    }
    next()
})

api.get('/info', function (req, res) {
    const lang = getLang(req)
    const id = req.query.id

    ytdl.getInfo(id, { lang }).then(function (info) {
        res.json(info)
    }).catch(function (err) {
        res.status(500).json({
            error: err.toString().replace(/^Error(?::\s*)/, ''),
            errCode: 0x0401
        })
    })
})

api.get('/infoPlaylist', (req, res) => {
    // PLIm1cC9KsS_0AvI3B30PikS7A2k_puXTr
    const lang = getLang(req)
    const playlistId = req.query.id

    const opts = [
        'list=' + playlistId,
        'hl=' + lang,
        'bpctr=' + Math.ceil(Date.now() / 1000)
    ].join('&')

    fetch('https://www.youtube.com/playlist?' + opts, {
        'headers': {
            'Accept-Language': lang,
            // Setting the UA to a modern browser tricks yt into using the newer framework
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
        }
    })
    .then(res => res.text())
    .then(txt => {
        let payload = txt.split('window["ytInitialData"] = ').pop().split(';\n')[0]
        const json = JSON.parse(payload)

        // Shit's deep:
        // json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents

        const playlistElements = guard(safeLookup(json, [
            'contents',
            'twoColumnBrowseResultsRenderer',
            'tabs',
            0,
            'tabRenderer',
            'content',
            'sectionListRenderer',
            'contents',
            0,
            'itemSectionRenderer',
            'contents',
            0,
            'playlistVideoListRenderer',
            'contents'
        ]), playlistElements => playlistElements.map(vid => vid.playlistVideoRenderer))

        if (!playlistElements) {
            return res.json({ errCode: 0x0402 })
        }
        
        res.json({
            elements: playlistElements,
            info: json.microformat.microformatDataRenderer
        })
    })
    .catch(err => res.json({ errCode: 0x0402 }))
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
api.get('/search', function (req, res) {
    const q = req.query.q || ''
    const page = Math.max(1, req.query.page || 1)

    ytSearch({
        query: q,
        pageStart: page,
        pageEnd: page + 1
    }, function (err, results) {
        if (err) {
            res.status(500).json({
                error: err.toString().replace(/^Error(?::\s*)/, ''),
                errCode: 0x0401
            })
            return
        }
        
        res.json({
            query: q,
            page: page,
            vids: results.videos
                .filter(e => e.videoId !== 'L&ai')
                .map(v => {
                    v.thumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
                    v.ago = v.ago.replace('Streamed ', '')
                    delete v.url
                    return v
                }
            )
        })
    })
})

api.get('/progress/:id', function (req, res) {
    res.json(
        progresses[req.params.id] || {
            // Progress ID invalid
            errCode: 0x0410
        }
    )
})

api.post('/download', function (req, res) {
    const id = req.body.id || ''
    if (!ytdl.validateID(id)) {
        res.status(400)
        res.json({
            // error: "YouTube video ID invalid",
            errCode: 0x0302
        })
        return
    }
    
    const { videoItag, audioItag, outFormat } = req.body

    if (acceptedFormats.indexOf(req.body.outFormat) === -1) {
        res.status(400)
        res.json({
            // error: "Invalid output format",
            errCode: 0x0411
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
            // error: "No input files provided",
            errCode: 0x0412
        })
        return
    }

    progresses[dlid] = { started: true }

    res.json({
        dlid: dlid,
        poll: `/api/progress/${dlid}`
    })

    Promise.allSettled([video, audio]).then(function (results) {
        const err = results.find(p => p.status === 'rejected')

        if (err) {
            // progresses[dlid].error = "Format download error"
            progresses[dlid].errCode = 0x0504
            return
        }

        console.log('Download finished successfully, joining with ffmpeg')
        const outFileName = `${dlid}.${req.body.outFormat}`
        const both = path.resolve(`${rootPath}/yt-downloads/${outFileName}`)
        const command = ffmpeg()

        command.on('progress', function (progress) {
            progresses[dlid].merge = (progresses[dlid].merge || {})
            progresses[dlid].merge = {
                progress: Math.min(1, progress.percent / 100)
            }
        })
        command.on('end', function () {
            console.log('Merge finished!')
            progresses[dlid].finished = true
            progresses[dlid].merge.finished = true
            progresses[dlid].url = `/api/yt-downloads/${outFileName}`
        })
        command.on('error', function (e) {
            console.log(e)
            progresses[dlid].error = e.toString() || "Conversion error",
            progresses[dlid].errCode = 0x0503
        })

        // Because if statements suck
        video && command.input(results[0].value.output)
        audio && command.input(results[1].value.output)

        command.format(outFormat)
            .inputOptions('-strict experimental')
            .save(both)
    })

})

api.get('/yt-downloads/:vid', function (req, res) {
    res.download(
        path.resolve(`${rootPath}/yt-downloads/${req.params.vid}`)
    )
})

function ytdlSave(id, dlid, itag) {
    return new Promise(function (resolve, reject) {
        let output = `${rootPath}/yt-downloads/${dlid}-${itag}.`
        let writeStream
        let codec
        const stream = ytdl(id, {
            quality: itag
        }).on('info', function (e) {
            progresses[dlid][itag] || (progresses[dlid][itag] = {})
            progresses[dlid][itag].finished = false
            progresses[dlid][itag].progress = 0
            // codecs = e.codecs

            // Before writing to the output stream, we gotta get the container lol
            // So we call ytdl before we know the container to get it, then pipe it to the output
            output += guard(
                e.formats.find(a => a.itag == itag),
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

export default api
