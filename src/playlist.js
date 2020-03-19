(function () {
    'use strict'

    // Assert the global yt is defined
    if (!yt) {
        throw Error("yt isn't defined, idk what to do.")
    }

    yt.views = yt.views || {}

    yt.views.playlistInit = init
    
    yt.views.playlistReplace = function (playlistId, wasReplaced) {
        document.getElementById('view').classList.add('anim--fuck-this-shit-im-out')
        yt.views.playlistInit(playlistId, wasReplaced)
    }

    function init(playlistId, wasReplaced) {
        const searchParams = yt.cleanUpSearchParams()
        const view = document.getElementById('view')

        searchParams.set('list', playlistId)

        if (!wasReplaced) {
            history.pushState({
                qi: yt.qi(),
                view: 'playlist',
                params: searchParams.toString(),
                pid: playlistId
            }, playlistId, `/playlist?${searchParams}`)
        }

        setLoading(view)

        fetch(`/api/infoPlaylist?list=${playlistId}&lang=${yt.lang}`)
            .then(r => r.json())
            .then(yt.rejectOnFetchErr)
            .then(playlist => {
                // Set the document title to the video title
                // (may be overwritten later)
                document.title = `${playlist.info.title} • yt-for-me`

                window.info = playlist

                // Prepare the content div for population
                view.innerHTML = ''
                view.classList.remove('anim--fuck-this-shit-im-out', 'search--empty-state')

                // Populate the div
                view.append(generateView(playlist))
            })
            .catch(err => {
                // If an error occurred, tell the user about it.
                console.log(err)
                view.innerHTML = dict('errors/error400', err)
            })
    }

    function setLoading(cont) {
        const loading = document.createElement('p')
        loading.classList.add('loading')
        loading.innerHTML = choose(yt.dict.loadingBlobs)
        cont.prepend(loading)
    }

    function generateView(playlist) {
        const playlistContainer = document.createElement('div')
        playlistContainer.classList.add('yt')

        playlistContainer.append(
            // generateFrame(playlist),
            // generateHeader(playlist),
            generateTile(playlist),
            generateDesc(playlist),
            generateList(playlist)
        )
        return playlistContainer
    }

    function generateFrame(playlist) {
        const div = document.createElement('div')
        div.classList.add('yt-embed')

        div.innerHTML = `
            <iframe src="https://www.youtube.com/embed/videoseries?list=${playlist.info.pid}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `

        return div
    }

    function generateHeader(playlist) {
        const div = document.createElement('div')
        div.classList.add('yt-meta')

        div.innerHTML = `
            <span class="yt-meta__title">${playlist.info.title}</span>
            <span>${
                dict('playlist/count', playlist.info.actualCount)
            } • ${
                dict('view/metaViews', playlist.info.views)
            }</span>
            <p class="yt-meta__desc">${
                info.info.description ||
                `<em class="yt-meta__data">${dict('view/noDesc')}</em>`
            }</p>
        `
        if (playlist.info.isUnlisted) {
            div.querySelector('.yt-meta__title').innerHTML +=
                `&nbsp;<span class="badge">${dict('playlist/unlisted')}</span>`
        }

        return div
    }

    function generateDesc(playlist) {
        const div = document.createElement('div')
        div.classList.add('yt-desc')

        div.innerHTML = playlist.info.description || `<em class="yt-meta__data">${dict('view/noDesc')}</em>`

        return div
    }

    function generateTile(playlist) {
        const div = document.createElement('div')
        div.classList.add('tile')

        div.innerHTML = `
            <img alt="" src="${
                safeLookup(
                    playlist,
                    ['elements', 0, 'thumbnail', 'thumbnails', 0, 'url']
                ) || playlist.info.thumbnails[playlist.info.thumbnails.length - 1].url
            }">
            <div class="tile-text">
                <span class="yt-meta__title">${playlist.info.title}</span>
                <span>${
                    dict('playlist/count', playlist.info.actualCount)
                } • ${
                    dict('view/metaViews', playlist.info.views)
                }</span>
            </div>
        `
        if (playlist.info.isUnlisted) {
            div.querySelector('.yt-meta__title').innerHTML +=
                `&nbsp;<span class="badge">${dict('playlist/unlisted')}</span>`
        }

        return div
    }

    function generateList(playlist) {
        const div = document.createElement('div')
        if (playlist.elements.length !== playlist.info.actualCount) {
            const err = document.createElement('div')
            err.classList.add('warn')
            err.innerHTML = `
                <p>${dict('playlist/exceeds100', playlist.info.actualCount)}</p>
            `
            div.append(err)
        }
        const ol = document.createElement('ol')
        div.append(ol)
        ol.classList.add('a11y-list', 'search-list')
        ol.setAttribute('style', 'margin: 0;')

        playlist.elements.forEach((el, i) => {
            const li = document.createElement('li')
            li.classList.add('search-li')
            li.style.setProperty('--anim-stagger', i)
            const a = document.createElement('a')
            li.append(a)
            a.classList.add('search-card')
            a.href = `/${el.videoId}${location.search}`
            a.dataset.id = el.videoId

            a.onclick = event => {
                if (yt.views && yt.views.videoReplace) {
                    event.preventDefault()
                    yt.views.videoReplace(a.dataset.id)
                }
            }
            a.setAttribute('title', el.title.simpleText)
            a.setAttribute('aria-label', el.title.simpleText)

            a.innerHTML = `
                <div class="search-card-content">
                    <span class="search-card-entry">${el.title.simpleText}</span>
                    <span class="search-card-entry">
                        ${dict('search/by', el.shortBylineText.runs[0].text)} •
                        ${el.lengthText.simpleText}
                    </span>
                </div>
                <div class="search-card-cover" style="background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url('${el.thumbnail.thumbnails[0].url}');" aria-hidden>
                    <span class="search-card-duration">${el.lengthText.simpleText}</span>
                </div>
            `

            ol.append(li)
        })

        return div
    }
})()
