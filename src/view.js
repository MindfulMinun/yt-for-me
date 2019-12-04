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
                    <!--
                    <div class="yt-btn-group">
                        <button class="yt-btn">${dict.view.dlListBoth()}</button>
                        <button class="yt-btn">${dict.view.dlListAudio()}</button>
                        <button class="yt-btn">${dict.view.dlListVideo()}</button>
                    </div>
                    -->
                    <label>
                        Audio: 
                        <select class="yt-select yt-select--compact">
                        <option>Sin audio</option>
                        <option>mp3</option>
                        <option>acc</option>
                        <option>ogg</option>
                        <option>webm</option>
                        </select>
                    </label>
                    <label>
                        Video: 
                        <select class="yt-select yt-select--compact">
                            <option>Sin video</option>
                            <option>mp4</option>
                            <option>acc</option>
                            <option>mpeg</option>
                            <option>webm</option>
                        </select>
                    </label>
                    <label>
                        Salida: 
                        <select class="yt-select yt-select--compact">
                            <optgroup label="Audio">
                                <option>mp3</option>
                                <option>acc</option>
                                <option>ogg</option>
                                <option>webm</option>
                            </optgroup>
                            <optgroup label="Video (y también audio)">
                                <option>mp4</option>
                                <option>acc</option>
                                <option>mpeg</option>
                                <option>webm</option>
                            </optgroup>
                        </select>
                    </label>
                    <!--
                    <div class="yt-dl__lists">
                        <ul>
                            <li><strong>${dict.view.dlListBoth()}</strong></li>
                        </ul>
                        <ul>
                            <li><strong>${dict.view.dlListAudio()}</strong></li>
                        </ul>
                        <ul>
                            <li><strong>${dict.view.dlListVideo()}</strong></li>
                        </ul>
                    </div>
                    -->
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

        info.formats.forEach(function (f, i) {
            return; // Just don't do anything for now.
            // f for format
            let li = document.createElement('li')
            ,   inner = ''
            , dlList
    
            if (f.encoding && f.audioEncoding) {
                // Both
                dlList = view.querySelectorAll('.yt-dl ul')[0]
            } else if (!f.encoding && f.audioEncoding) {
                // Audio only
                dlList = view.querySelectorAll('.yt-dl ul')[1]
            } else if (f.encoding && !f.audioEncoding) {
                // Video only
                dlList = view.querySelectorAll('.yt-dl ul')[2]
            } else {
                // Neither?
                return
            }
    
            if (f.encoding) {
                inner += `${f.container} (${f.resolution})`
            }
            if (f.audioEncoding) {
                inner ? inner += " " : false
                inner += `${f.audioEncoding} (${f.audioBitrate})`
            }
    
            li.innerHTML = `
                <a href="${f.url}" download>${inner}</a>
            `
            dlList.appendChild(li)
        })
    
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

})()
