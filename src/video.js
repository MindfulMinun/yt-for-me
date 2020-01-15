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
            cont.innerHTML = dict('errors/idAssertionFailed', {errCode: 0x0032})
            return Promise.reject()
        }
        history.pushState(id, id, '/' + id + location.search)

        // Display a loading blob (blob = message before UI loads)
        const loading = document.createElement('p')
        loading.classList.add('loading')
        loading.innerHTML = choose(yt.dict.loadingBlobs)
        cont.prepend(loading)

        // Get video data
        return fetch(`/api/info?id=${id}&lang=${yt.dict.lang}`, {
            headers: {
                'Accept': 'application/json'
            }
        }).then(res => res.json())
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
            cont.innerHTML = dict('errors/error400', err)
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
                        <label id="label-audio" class="flex">
                            <span class="yt-dl__txt-label">${dict('dlForm/audioLabel')}:</span>
                            <select class="yt-select yt-select--compact flex-stretch" name="audioItag" disabled>
                                <option value="none">${dict('dlForm/kind/noAudio')}</option>
                            </select>
                        </label>
                        <label id="label-video" class="flex">
                            <span class="yt-dl__txt-label">${dict('dlForm/videoLabel')}:</span>
                            <select class="yt-select yt-select--compact flex-stretch" name="videoItag" disabled>
                                <option value="none">${dict('dlForm/kind/noVideo')}</option>
                            </select>
                        </label>
                        <label id="label-out" class="flex">
                            <span class="yt-dl__txt-label">${dict('dlForm/outLabel')}:</span>
                            <select class="yt-select yt-select--compact flex-stretch" name="outFormat" disabled>
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
                        id="yt-iframe"
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
        // Split the formats into video and audio
        const filteredFormats = info.formats
            // Exclude live formats
            .filter(f => !f.live)
            // Exclude mixed formats
            // We want only audio formats or only video formats
            .filter(f => !!f.audioQuality ^ !!f.qualityLabel)
            .sort((l, r) => r.audioBitrate - l.audioBitrate)
        
        // Split them into video and audio arrays
        const [vids, auds] = filteredFormats.partition(f => !f.audioQuality)

        // Generate a table with the filtered formats
        view.querySelector('details').appendChild(createTable(filteredFormats))
            
        // Add the format options in the dropdowns
        auds.forEach(format => {
            const select = view.querySelector('#label-audio select')
            const option = document.createElement('option')
            let out = ''
            out += `${format.itag}: `
            out += dict('dlForm/qualityHelper', format.audioQuality, format.audioBitrate)
            out += ` ${format.container} @ ${Math.round(+format.audioSampleRate / 100) / 10}`
            out += 'kHz'

            option.innerText = out
            option.value = format.itag

            select.appendChild(option)
        })
        vids.forEach(format => {
            const select = view.querySelector('#label-video select')
            const option = document.createElement('option')
            let out = ''
            out += `${format.itag}: `
            out += dict('dlForm/qualityHelper', format.quality, format.qualityLabel)
            out += ` ${format.container} (${format.codecs})`

            option.innerText = out
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

                document.querySelector('xyz-sheet').open()

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

        view.querySelectorAll('[data-timestamp]').forEach(el => {
            el.onclick = function (e) {
                const iframe = document.getElementById('yt-iframe')
                if (!iframe) return
                e.preventDefault()
                const url = new URL(iframe.src)
                
                // For every more significant group, multiply by powers of 60
                const timestamp = el.dataset.timestamp
                    .split(':')
                    .reverse()
                    .map((a, i) => +a * (60 ** i))
                    .reduce((acc, v) => acc + v)
                
                // Set the timestamp and replace the src
                url.searchParams.set('start', timestamp)
                iframe.src = url

                // Scroll to the iframe so the user sees it
                scrollTo(0, 0)
            }
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

        vid.id = info.video_id

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

        vid.description =
            vid.description
            .replace(yt.REGEX_URL, match => {
                let url
                try {
                    url = new URL(match)
                } catch (e) {
                    // If the regex matched but it couldn't be parsed by URL,
                    // give up parsing
                    console.log(`Warning: Matched “${match}” but marked as invalid by URL constructor`)
                    return match
                }
                let out = `<a href="${match}" target="_blank">`
                out += url.hostname.replace(/^www\./, '')
                out += (url.pathname !== '/' && url.pathname) || ''
                out += '</a>'
                return out
            })
            .replace(yt.REGEX_HASHTAG, match => {
                const q = new URLSearchParams(location.search)
                q.set('q', match)
                return `<a href="/search?${q}">${match}</a>`
            })
            .replace(yt.REGEX_TIMESTAMP, match => {
                return `<a href="/${vid.id}" data-timestamp="${match}">${match}</a>`
            })

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
                    <th>${dict('dlForm/tableHeaders/container')}</th>
                    <th>${dict('dlForm/tableHeaders/codecs')}</th>
                    <th>${dict('dlForm/tableHeaders/quality')}</th>
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
                    dict(`dlForm/kind/${f.audioQuality ? 'audio' : 'video'}`) 
                }</th>
                <th>${f.itag}</th>
                <th>${f.container}</th>
                <th>${f.codecs}</th>
                <th>${
                f.audioQuality ?
                    dict('dlForm/qualityHelper', f.audioQuality, f.audioBitrate) :
                    dict('dlForm/qualityHelper', f.quality, f.qualityLabel)
                }</th>
                <th>${f.audioSampleRate ? Math.round(+f.audioSampleRate / 100) / 10 + 'kHz' : ''}</th>
            `
            tbody.appendChild(tr)
        });
        div.appendChild(table)
        return div
    }
})()
