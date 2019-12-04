(function () {
    'use strict'

    // Assert the global yt is defined
    if (!yt) {
        throw Error("yt isn't defined, idk what to do.")
    }

    // Some locals for later
    const dict = yt.dict
    const cont = document.querySelector('div.container')

    // Listen for back/forward events
    // Bootstrap view handles view loading
    window.addEventListener('popstate', function (e) {
        console.log(e)
        guard(
            document.querySelector('.view'),
            view => cont.classList.add('anim--fuck-this-shit-im-out')
        )
        if (e.state && (e.state !== (window.vid && window.vid.video_id))) {
            bootstrapView(e.state)
        } else {
            history.back()
        }
    })

    // On page load, load the video the URL is currently at
    bootstrapView(
        guard(yt.REGEX_CAPTURE_ID.exec(location.pathname.slice(1) || ''),
            match => match[0]
        ) || ''
    )

    function bootstrapView(id) {
        if (!yt.REGEX_CAPTURE_ID.test(id)) {
            cont.innerHTML = dict.errors.idAssertionFailed(id)
            throw Error("ID didn't match regex, something's wrong.")
        }
        history.pushState(id, id, '/' + id + location.search)

        // Display a loading blob (blob = message before UI loads)
        const loading = document.createElement('p')
        loading.classList.add('loading')
        loading.innerHTML = choose(dict.loadingBlobs)
        cont.prepend(loading)
        
        // Get video data
        fetch(`/api/info?id=${id}&lang=${yt.dict.lang}`)
            .then(res => res.json())
            .then(json => json.error ? Promise.reject(json) : json)
            .then(function (info) {
                // Set the document title to the video title
                document.title = `${info.title} • yt-for-me`

                // Prepare the content div for population
                cont.innerHTML = ''
                cont.classList.remove('anim--fuck-this-shit-im-out')

                // Populate the div
                cont.appendChild(genView(info))
                cont.appendChild(makeFooter())

                // Expose the vid data cuz why not
                window.vid = info
                console.log('Video info (window.vid):', info)
            })
            .catch(function (err) {
                console.log(err)
                cont.innerHTML = dict.errors.error400(err.error)
            })
    }

    function genView(info) {
        const view = document.createElement('div')
        const ps = info.player_response || {}
        view.classList.add('view')
        view.classList.add('mobile-edge-flush')

        // Cherry pick the properties we want from info and mod them here.
        const vid = cherryPickProperties(info)

        document.title = `${vid.title} • yt-for-me`
    
        view.innerHTML = `
            <div class="yt">
                <details class="yt-dl">
                    <summary>${dict.view.dlSummaryLabel()}</summary>
                    <p>${dict.view.dlSummaryPara()}</p>
                    <div class="yt-dl__mini-form">
                        <label id="label-audio">
                            Audio: 
                            <select class="yt-select yt-select--compact" disabled>
                                <option value="none">Sin audio</option>
                            </select>
                        </label>
                        <label id="label-video">
                            Video: 
                            <select class="yt-select yt-select--compact" disabled>
                                <option value="none">Sin video</option>
                            </select>
                        </label>
                        <label id="label-out">
                            Salida: 
                            <select class="yt-select yt-select--compact" disabled>
                                <optgroup label="Audio">
                                    <option value="mp3">mp3</option>
                                    <option value="acc">acc</option>
                                    <option value="ogg">ogg</option>
                                </optgroup>
                                <optgroup label="Video (y también audio)">
                                    <option value="mp4">mp4</option>
                                    <option value="mpeg">mpeg</option>
                                </optgroup>
                                <optgroup label="Ambos">
                                    <option value="mp4" selected>mp4</option>
                                    <option value="webm">webm</option>
                                </optgroup>
                            </select>
                        </label>
                        <label>
                            <button class="yt-btn" disabled>Convertir</button>
                        </label>
                    </div>
                </details>
                <div class="yt-embed">
                    <iframe
                        title="${dict.view.iframeA11yLabel(info.title)}" frameborder="0"
                        src="https://www.youtube.com/embed/${info.video_id}?autoplay=1&hl=${dict.lang}"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="yt-related"></div>
                <div class="yt-meta">
                    <span class="yt-meta__title">${vid.title}</span>
                </div>
                <div class="yt-desc">${
                    guard(ps.microformat, mf => guard(
                        mf.playerMicroformatRenderer,
                        pmr => guard(
                            pmr.description, desc => desc.simpleText
                        )
                    )) || info.description
                }</div>
            </div>
        `

        const filteredFormats = info.formats.filter(f => {
            // Get formats that aren't live, and are either all audio or all video
            return !f.live & ((!!f.resolution) ^ (!!f.audioEncoding))
        }).sort((a, b) => {
            if (!!a.audioEncoding === !!b.audioEncoding) {
                return 0
            }
            return !a.audioEncoding ? 1 : -1
        })

        view.querySelector('details').appendChild(createTable(filteredFormats))
            
        // Add the options in the dropdowns
        filteredFormats.forEach(format => {
            const select = [
                view.querySelector('#label-audio select'),
                view.querySelector('#label-video select')
            ][format.audioEncoding ? 0 : 1]

            const option = document.createElement('option')
            option.innerText = `${format.itag}: ${
                format.audioEncoding || format.encoding
            } (${format.container})${
                format.audio_sample_rate ?
                    ' @ ' + Math.round(+format.audio_sample_rate / 100) / 10 + 'kHz' :
                    ' @ ' + format.resolution
            }`

            option.value = format.itag

            select.appendChild(option)
        })
            
        // Enable the dropdowns and the dl button
        view.querySelectorAll('.yt-dl__mini-form select, .yt-dl__mini-form button').forEach(el => {
            el.removeAttribute('disabled')
        })
        
        ;(() => {
            const meta = view.querySelector('.yt-meta')

            vid.views && meta.appendChild(createMetaTag(
                dict.view.metaViews(vid.views)
            ))
            
            info.published && meta.appendChild(createMetaTag(
                dict.view.metaPublished(info.published)
            ))
            vid.author && meta.appendChild(createMetaTag(
                vid.album ?
                    dict.view.metaAlbumAuthor(vid.album, vid.author) :
                    dict.view.metaAuthor(vid.author)
            ))
            vid.license && meta.appendChild(createMetaTag(
                dict.view.metaLicense(vid.license)
            ))

        })();

        const category = guard(
            info.player_response,
            pr => guard(
                pr.microformat,
                mf => guard(
                    mf.playerMicroformatRenderer,
                    pmr => pmr.category
                )
            )
        ) || false

        if (category) {
            view.querySelector('.yt-meta').dataset.category = category
        }
    
        const rel = view.querySelector('.yt-related')

        // Append end search card
        ;((card) => {
            card.href = '/search' + location.search
            card.classList.add('yt-card')
            card.classList.add('yt-card--back-to-search')
            card.setAttribute('aria-label', dict.view.searchLabel())
            card.innerHTML = `
            <div class="yt-card--back-to-search__container">
                <i class="material-icons">search</i>
                <span class="yt-card-label">${dict.view.searchLabel()}</span>
            </div>
        `
            card.onclick = e => cont.classList.add('anim--fuck-this-shit-im-out')

            rel.appendChild(card)
        })(document.createElement('a'))
    
        ;info.related_videos.forEach(function (vid, i) {
            if (vid.list) return
            let card = document.createElement('a')
            card.href = '/' + vid.id + location.search
            card.dataset.id = vid.id
            card.onclick = function (e) {
                e.preventDefault()
                const id = this.dataset.id
                cont.classList.add('anim--fuck-this-shit-im-out')
                bootstrapView(id)
            }
            card.classList.add('yt-card')
            // card.style.backgroundImage = `url(${vid.iurlhq})`
            // card.style.backgroundImage = `
            //     linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)),
            //     url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)
            // `
            card.style.setProperty('--card-bg-image', `url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)`)
            card.innerHTML = `
                <div class="yt-card--info">
                    <strong>${vid.title}</strong>
                    <span>${dict.view.cardAuthor(vid.author)}</span>
                    <span>${dict.view.cardViews(vid.short_view_count_text)}</span>
                </div>
            `
            rel.appendChild(card)
        })

        return view
    }

    function cherryPickProperties(info) {
        const vid = {}
        const ps = info.player_response || {}

        // Check media title (song title),
        // then check the microformat title (translated???)
        // then default the basic property
        vid.title = (info.media && info.media[
            dict.propertyLookup.song
        ]) || guard(ps.microformat, mf => guard(
            mf.playerMicroformatRenderer,
            r => guard(r.title, t => t.simpleText)
        )) || info.title

        vid.author = (info.media && info.media[
            dict.propertyLookup.artist
        ]) || info.author.name

        vid.album = info.media && info.media[
            dict.propertyLookup.album
        ]

        vid.license = info.media && info.media[
            dict.propertyLookup.license
        ]

        vid.isExplicit = !!(info.media && info.media[
            dict.propertyLookup.explicit
        ])

        vid.views = +ps.videoDetails.viewCount

        return vid
    }

    function createMetaTag(innerHTML) {
        const span = document.createElement('span')
        span.classList.add('yt-meta__data')
        span.innerHTML = innerHTML
        return span
    }

    function createTable(filteredFormats) {
        const div = document.createElement('div')
        const table = document.createElement('table')
        div.classList.add('yt-table')
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Valor itag</th>
                    <th>Codificación</th>
                    <th>Contenedor</th>
                    <th>Resolución</th>
                    <th>Freq. de muestreo</th>
                </tr>
            </thead>
            <tbody></tbody>
        `
        
        const tbody = table.querySelector('tbody')
    
        filteredFormats.forEach(f => {
            const tr = document.createElement('tr')
        
            tr.innerHTML = `
                <th>${f.audioEncoding ? 'Audio' : 'Video'}</th>
                <th>${f.itag}</th>
                <th>${f.audioEncoding || f.encoding}</th>
                <th>${f.container}</th>
                <th>${f.resolution || ''}</th>
                <th>${f.audio_sample_rate ? Math.round(+f.audio_sample_rate / 100) / 10 + 'kHz' : ''}</th>
            `
            tbody.appendChild(tr)
        });
        div.appendChild(table)
        return div
    }
})()
