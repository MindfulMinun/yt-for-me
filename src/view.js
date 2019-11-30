(function () {
    'use strict'

    if (!yt) {
        throw Error("yt isn't defined, idk what to do.")
    }

    yt.REGEX_CAPTURE_ID = /([a-zA-Z\d\-_]{11})/

    const dict = yt.dict
    const cont = document.querySelector('div.container')

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

    bootstrapView(
        guard(yt.REGEX_CAPTURE_ID.exec(location.pathname.slice(1) || ''), match => {
            return match[0]
        }) || ''
    )

    function bootstrapView(id) {
        if (!yt.REGEX_CAPTURE_ID.test(id)) {
            cont.innerHTML = dict.errors.idAssertionFailed(id)
            throw Error("ID didn't match regex, something's wrong.")
        }
        history.pushState(id, id, '/' + id + location.search)
        const loading = document.createElement('p')
        loading.classList.add('loading')
        loading.innerHTML = choose(dict.loadingBlobs)
        cont.prepend(loading)
        fetch(`/api/info?id=${id}&lang=${yt.dict.lang}`)
            .then(res => res.json())
            .then(json => json.error ? Promise.reject(json) : json)
            .then(function (info) {
                document.title = `${info.title} • yt-for-me`
                cont.innerHTML = ''
                cont.classList.remove('anim--fuck-this-shit-im-out')
                cont.appendChild(genView(info))
                cont.appendChild(makeFooter())
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
    
        view.innerHTML = `
            <div class="yt">
                <details class="yt-dl">
                    <summary>${dict.view.dlSummaryLabel()}</summary>
                    <p>${dict.view.dlSummaryPara()}</p>
                    <div class="yt-btn-group">
                        <button class="yt-btn">${dict.view.dlListBoth()}</button>
                        <button class="yt-btn">${dict.view.dlListAudio()}</button>
                        <button class="yt-btn">${dict.view.dlListVideo()}</button>
                    </div>
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
                    <span class="yt-meta__title">${
                        (info.media && info.media.song) || info.title
                    }</span>
                    <span class="yt-meta__data">${
                        dict.view.metaViews(ps.videoDetails.viewCount)
                    }</span>
                    <span class="yt-meta__data">${
                        dict.view.metaPublished(info.published)
                    }</span>
                    <span class="yt-meta__data">${
                        dict.view.metaAuthor((info.media && info.media.artist
                        ) || info.author.name)
                    }</span>
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
    
        const category = guard(
            info.player_response,
            pr => guard(
                pr.microformat,
                mf => guard(
                    mf.playerMicroformatRenderer,
                    pmr => pmr.category
                )
            )
        ) || (info.media && info.media.category) || null


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


})()
