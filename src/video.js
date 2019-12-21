(function () {
    'use strict'

    // Assert the global yt is defined
    if (!yt) {
        throw Error("yt isn't defined, idk what to do.")
    }

    // Some locals for later
    //================================================================================
    //================================================================================
    //================================================================================
    const cont = document.querySelector('div.container')

    // Listen for back/forward events
    // Bootstrap view handles view loading
    window.addEventListener('popstate', function (e) {
        console.log(e)
        // Anim the card out
        guard(
            document.querySelector('.view'),
            view => cont.classList.add('anim--fuck-this-shit-im-out')
        )
        // If there's a state, load it.
        // Otherwise, the user was probably trying to go back.
        if (e.state && (e.state !== (window.info && window.info.video_id))) {
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

    // Get video information required for loading the view
    function bootstrapView(id) {
        // Assert that the id is a YouTube id
        if (!yt.REGEX_CAPTURE_ID.test(id)) {
            // ID didn't match regex, something's wrong.
            cont.innerHTML = dict('errors/idAssertionFailed', id)
            cont.appendChild(makeFooter())
            return Promise.reject()
        }
        history.pushState(id, id, '/' + id + location.search)

        // Display a loading blob (blob = message before UI loads)
        const loading = document.createElement('p')
        loading.classList.add('loading')
        loading.innerHTML = choose(yt.dict.loadingBlobs)
        cont.prepend(loading)

        // Get video data
        return fetch(`/api/info?id=${id}&lang=${yt.dict.lang}`)
        .then(res => res.json())
        .then(json => json.error ? Promise.reject(json) : json)
        .then(function (info) {
            // Set the document title to the video title
            // (may be overwritten later)
            document.title = `${info.title} • yt-for-me`

            // Prepare the content div for population
            cont.innerHTML = ''
            cont.classList.remove('anim--fuck-this-shit-im-out')

            // Populate the div
            cont.appendChild(genView(info))
        })
        .catch(function (err) {
            console.log(err)
            // If an error occurred, tell the user about it.
            cont.innerHTML = dict('errors/error400', err.error)
        }).finally(function () {
            cont.appendChild(makeFooter())
        })
    }

    // Once we've recieved the vid data, generate the view
    function genView(info) {
        // Wrapper div yay
        const view = document.createElement('div')
        view.classList.add('view')
        view.classList.add('mobile-edge-flush')

        // Cherry pick the properties we want from info and mod them here.
        // And expose the vid data into the global cuz why not
        const vid = cherryPickProperties(info)
        window.vid = vid
        window.info = info
        console.log('Video info (window.info):', info)
        console.log('Cherry-picked video properties (window.vid):', vid)

        // Overwrite the video title (neccesary if the vid's a music vid)
        document.title = `${vid.title} • yt-for-me`
    
        // Construct the view
        view.innerHTML = `
            <div class="yt">
                <details class="yt-dl">
                    <summary>${dict('dlForm/label')}</summary>
                    <p>${dict('dlForm/howTo')}</p>
                    <div class="yt-dl__mini-form">
                        <label id="label-audio">
                            ${dict('dlForm/audioLabel')}: 
                            <select class="yt-select yt-select--compact" name="audioItag" disabled>
                                <option value="none">${dict('dlForm/kind/noAudio')}</option>
                            </select>
                        </label>
                        <label id="label-video">
                            ${dict('dlForm/videoLabel')}: 
                            <select class="yt-select yt-select--compact" name="videoItag" disabled>
                                <option value="none">${dict('dlForm/kind/noVideo')}</option>
                            </select>
                        </label>
                        <label id="label-out">
                            ${dict('dlForm/outLabel')}: 
                            <select class="yt-select yt-select--compact" name="outFormat" disabled>
                                <optgroup label="${dict('dlForm/kind/onlyAudio')}">
                                    <option value="mp3">mp3</option>
                                    <option value="acc">acc</option>
                                    <option value="ogg">ogg</option>
                                </optgroup>
                                <optgroup label="${dict('dlForm/kind/vidOrBoth')}">
                                    <option value="mp4" selected>mp4</option>
                                    <option value="webm">webm</option>
                                    <option value="mpeg">mpeg</option>
                                    <option value="mov">mov</option>
                                </optgroup>
                            </select>
                        </label>
                        <div>
                            <button class="yt-btn" disabled>${dict('dlForm/dlLabel')}</button>
                        </div>
                    </div>
                </details>
                <div class="yt-embed">
                    <iframe
                        title="${dict('view/iframeA11yLabel', info.title)}" frameborder="0"
                        src="https://www.youtube.com/embed/${info.video_id}?autoplay=1&hl=${yt.dict.lang}"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="yt-related"></div>
                <div class="yt-meta">
                    <span class="yt-meta__title">${vid.title}</span>
                </div>
                <div class="yt-desc">${vid.description}</div>
            </div>
        `

        // Get the formats. Filter out the ones that are live or have both encodings.
        const filteredFormats = info.formats.filter(f => {
            // Get formats that aren't live, and are either all audio or all video
            return !f.live & ((!!f.resolution) ^ (!!f.audioEncoding))
        }).sort((a, b) => {
            if (!!a.audioEncoding === !!b.audioEncoding) {
                return 0
            }
            return !a.audioEncoding ? 1 : -1
        })

        // Generate a table with the filtered formats
        view.querySelector('details').appendChild(createTable(filteredFormats))
            
        // Add the format options in the dropdowns
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
            

        // Add the event listener to the dl button
        view.querySelector('.yt-dl__mini-form button')
            .addEventListener('click', function (e) {
                this.disabled = true
                const selects = Array.from(view.querySelectorAll('.yt-dl__mini-form select'))
                const out = {
                    id: info.video_id
                }
                selects.map(el => [el.name, el.value]).forEach(el => {
                    out[el[0]] = el[1]
                })

                addToDownloadQueue(out)
            })

        // Enable the dropdowns and the dl button
        view.querySelectorAll('.yt-dl__mini-form select, .yt-dl__mini-form button').forEach(el => {
            el.removeAttribute('disabled')
        })
        
        // Add the video meta information
        ;(() => {
            const meta = view.querySelector('.yt-meta')

            vid.views && meta.appendChild(createMetaTag(
                dict('view/metaViews', vid.views)
            ))
            info.published && meta.appendChild(createMetaTag(
                dict('view/metaPublished', info.published)
            ))
            vid.author && meta.appendChild(createMetaTag(
                vid.album ?
                    dict('view/metaAlbumAuthor', vid.album, vid.author) :
                    dict('view/metaAuthor', vid.author)
            ))
            vid.license && meta.appendChild(createMetaTag(
                dict('view/metaLicense', vid.license)
            ))
        })();

        // If the video falls under a certain category (i.e. "Music")
        // add a class to add neat little icon next to the video title
        guard(
            info.player_response,
            pr => guard(
                pr.microformat,
                mf => guard(
                    mf.playerMicroformatRenderer,
                    pmr => guard(
                        pmr.category,
                        category => view.querySelector('.yt-meta').dataset.category = category
                    )
                )
            )
        )
    
        // Add the related video cards
        const rel = view.querySelector('.yt-related')

        // Add the "Return to search" card first
        ;((card) => {
            card.href = '/search' + location.search
            card.classList.add('yt-card')
            card.classList.add('yt-card--back-to-search')
            card.setAttribute('aria-label', dict('view/searchLabel'))
            card.innerHTML = `
            <div class="yt-card--back-to-search__container">
                <i class="material-icons">search</i>
                <span class="yt-card-label">${dict('view/searchLabel')}</span>
            </div>
        `
            card.onclick = e => cont.classList.add('anim--fuck-this-shit-im-out')

            rel.appendChild(card)
        })(document.createElement('a'))
            
        // Add the other related video cards
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
            card.style.setProperty('--card-bg-image', `url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)`)
            card.innerHTML = `
                <div class="yt-card--info">
                    <strong>${vid.title}</strong>
                    <span>${dict('view/cardAuthor', vid.author)}</span>
                    <span>${dict('view/cardViews', vid.short_view_count_text)}</span>
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
        // then check the microformat title (translated?)
        // then default the basic property
        vid.title = (info.media && info.media[
            yt.dict.propertyLookup.song
        ]) || guard(ps.microformat, mf => guard(
            mf.playerMicroformatRenderer,
            r => guard(r.title, t => t.simpleText)
        )) || info.title

        vid.author = (info.media && info.media[
            yt.dict.propertyLookup.artist
        ]) || info.author.name

        vid.album = info.media && info.media[
            yt.dict.propertyLookup.album
        ]

        vid.license = info.media && info.media[
            yt.dict.propertyLookup.license
        ]

        vid.isExplicit = !!(info.media && info.media[
            yt.dict.propertyLookup.explicit
        ])

        vid.description = guard(ps.microformat, mf => guard(
            mf.playerMicroformatRenderer,
            pmr => guard(
                pmr.description, desc => desc.simpleText
            )
        )) || info.description

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
                    <th>${dict('dlForm/tableHeaders/kind')}</th>
                    <th>${dict('dlForm/tableHeaders/itag')}</th>
                    <th>${dict('dlForm/tableHeaders/encoding')}</th>
                    <th>${dict('dlForm/tableHeaders/container')}</th>
                    <th>${dict('dlForm/tableHeaders/resolution')}</th>
                    <th>${dict('dlForm/tableHeaders/sampR8')}</th>
                </tr>
            </thead>
            <tbody></tbody>
        `
        
        const tbody = table.querySelector('tbody')
    
        filteredFormats.forEach(f => {
            const tr = document.createElement('tr')
        
            tr.innerHTML = `
                <th>${
                    dict(`dlForm/kind/${f.audioEncoding ? 'audio' : 'video'}`) 
                }</th>
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