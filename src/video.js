(function () {
    'use strict'

    // Assert the global yt is defined
    if (!yt) {
        throw Error("yt isn't defined, idk what to do.")
    }

    // Expose the videoInit function to the yt object
    yt.views = yt.views || {}
    yt.views.videoInit = videoInit

    yt.views.videoReplace = function (id, wasReplaced) {
        document.getElementById('view').classList.add('anim--fuck-this-shit-im-out')
        yt.views.videoInit(id, wasReplaced)
    }

    function videoInit(videoId, wasReplaced) {
        const searchParams = yt.cleanUpSearchParams()
        const view = document.getElementById('view')

        if (!yt.regexps.id.test(videoId)) {
            // ID didn't match regex, something's wrong.
            view.innerHTML = dict('errors/idAssertionFailed', {errCode: 0x0302})
            return Promise.reject()
        }

        searchParams.set('v', videoId)

        if (!wasReplaced) {
            history.pushState({
                qi: yt.qi(),
                view: 'video',
                params: searchParams.toString(),
                id: videoId
            }, videoId, `/video?${searchParams}`)
        }
    
        setLoading(view)

        // Get video data
        return fetch(`/api/info?id=${videoId}&lang=${yt.dict.lang}`, {
            headers: { 'Accept': 'application/json' }
        })
        .then(res => res.json())
        .then(yt.rejectOnFetchErr)
        .then(videoInfo => {
            // Set the document title to the video title
            // (may be overwritten later)
            document.title = `${videoInfo.title} • yt-for-me`

            window.info = videoInfo

            // Prepare the content div for population
            view.innerHTML = ''
            view.classList.remove('anim--fuck-this-shit-im-out', 'search--empty-state')

            // Populate the div
            view.append(generateView(videoInfo))
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

    function generateView(videoInfo) {
        const ytContainer = document.createElement('div')

        ytContainer.classList.add('yt')

        // Create the view
        ytContainer.append(
            generateYtDownloadForm(videoInfo),
            generateYtEmbed(videoInfo),
            generateYtRelated(videoInfo),
            generateYtMeta(videoInfo),
            generateYtDescription(videoInfo)
        )

        const cherry = cherryPickProperties(videoInfo)
        window.cherry = cherry

        document.title = `${cherry.title} • yt-for-me`
        return ytContainer
    }

    function generateYtDownloadForm(videoInfo) {
        const details = document.createElement('details')

        details.classList.add('yt-dl')
        details.innerHTML = `
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
        `

        // Split the formats into video and audio
        const filteredFormats = videoInfo.formats
            // Exclude live formats
            .filter(f => !f.live)
            // Exclude mixed formats
            // We want only audio formats or only video formats
            .filter(f => !!f.audioQuality ^ !!f.qualityLabel)
            .sort((l, r) => r.audioBitrate - l.audioBitrate)
        
        // Split them into video and audio arrays
        const [vids, auds] = filteredFormats.partition(f => !f.audioQuality)

        // Add the format options in the dropdowns
        // TODO: These functions are very similar, refactor and reduce to a single function
        vids.forEach(format => {
            const select = details.querySelector('#label-video select')
            const option = document.createElement('option')
            let out = ''
            out += `${format.itag}: `
            out += dict('dlForm/qualityHelper', format.quality, format.qualityLabel)
            out += ` ${format.container} (${format.codecs})`

            option.innerText = out
            option.value = format.itag

            select.append(option)
        })
        auds.forEach(format => {
            const select = details.querySelector('#label-audio select')
            const option = document.createElement('option')
            let out = ''
            out += `${format.itag}: `
            out += dict('dlForm/qualityHelper', format.audioQuality, format.audioBitrate)
            out += ` ${format.container} @ ${Math.round(+format.audioSampleRate / 100) / 10}`
            out += 'kHz'

            option.innerText = out
            option.value = format.itag

            select.append(option)
        })

        // Add the event listener to the dl button
        details.querySelector('button')
            .addEventListener('click', function (e) {
                this.disabled = true
                const selects = Array.from(details.querySelectorAll('select'))
                const out = {
                    id: info.video_id
                }
                selects.map(el => [el.name, el.value]).forEach(el => {
                    out[el[0]] = el[1]
                })

                document.querySelector('xyz-sheet').open()

                addToDownloadQueue(out)
            })

        // Enable the dropdowns and download button
        details.querySelectorAll('select, button')
               .forEach(el => el.removeAttribute('disabled'))
        
        // Add the table
        details.append(createTable(filteredFormats))
        
        return details
    }

    function generateYtEmbed(videoInfo) {
        const div = document.createElement('div')
        const iframe = document.createElement('iframe')
        div.classList.add('yt-embed')

        iframe.id = 'yt-iframe'
        iframe.setAttribute('title', dict('view/iframeA11yLabel', videoInfo.title))
        iframe.setAttribute('frameborder', 0)
        iframe.src = `https://www.youtube.com/embed/${videoInfo.video_id}?autoplay=1&hl=${yt.dict.lang}`
        iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture')
        iframe.setAttribute('allowfullscreen', true)

        // Expose the iframe so we can manipulate it later
        yt.iframe = iframe

        div.append(iframe)

        return div
    }

    function generateYtRelated(videoInfo) {
        const related = document.createElement('div')
        related.classList.add('yt-related')

        // First, add the "Return to search" button
        const backToSearch = document.createElement('a')

        backToSearch.href = '/search' + location.search
        backToSearch.classList.add('yt-card', 'yt-card--back-to-search')
        backToSearch.setAttribute('aria-label', dict('view/searchLabel'))
        backToSearch.innerHTML = `
            <div class="yt-card--back-to-search__container">
                <i class="material-icons">search</i>
                <span class="yt-card-label">${dict('view/searchLabel')}</span>
            </div>
        `
        backToSearch.style.setProperty('--anim-stagger', 0)
        backToSearch.onclick = e => {
            e.preventDefault()
            yt.views.searchReplace()
        }

        related.append(backToSearch)

        videoInfo.related_videos.forEach((vid, i) => {
            if (vid.list) return
            const card = document.createElement('a')
            card.href = '/' + vid.id + location.search
            card.dataset.id = vid.id
            card.onclick = function (e) {
                e.preventDefault()
                yt.views.videoReplace(this.dataset.id)
            }
            card.classList.add('yt-card')
            card.style.setProperty('--card-bg-image', `url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)`)
            card.style.setProperty('--anim-stagger', i + 1)
            card.innerHTML = `
                <div class="yt-card--info">
                    <strong>${vid.title}</strong>
                    <span>${dict('view/cardAuthor', vid.author)}</span>
                    <span>${dict('view/cardViews', vid.short_view_count_text)}</span>
                </div>
            `
            related.append(card)
        })

        return related
    }

    function generateYtMeta(videoInfo) {
        const meta = document.createElement('div')
        const cherry = cherryPickProperties(videoInfo)
        meta.classList.add('yt-meta')

        // Set the title
        meta.innerHTML = `<span class="yt-meta__title">${cherry.title}</span>`
            
        if (cherry.isUnlisted) {
            meta.querySelector('.yt-meta__title').innerHTML +=
                `&nbsp;<span class="badge">${dict('playlist/unlisted')}</span>`
        }

        // Set the other info properties
        ;(cherry.views != null) && meta.append(_createMetaTag(dict('view/metaViews', cherry.views)))
        videoInfo.published && meta.append(_createMetaTag(dict('view/metaPublished', videoInfo.published)))
        cherry.author && meta.append(_createMetaTag(
            cherry.albumUrl ?
                dict('view/metaAlbumAuthor', cherry.albumUrl, cherry.artistUrl) :
                dict('view/metaAuthor', cherry.author)
        ))
        cherry.license && meta.append(_createMetaTag(dict('view/metaLicense', cherry.license)))

        // Set the category as a data-* property
        guard(safeLookup(info.player_response, [
            'microformat',
            'playerMicroformatRenderer',
            'category',
        ]), category => meta.dataset.category = category)

        meta.querySelectorAll('a').forEach(el => {
            el.onclick = event => document.getElementById('view').classList.add('anim--fuck-this-shit-im-out')
        })

        return meta
    }

    function generateYtDescription(videoInfo) {
        const cherry = cherryPickProperties(videoInfo)
        const desc = document.createElement('div')
        desc.classList.add("yt-desc")

        if (!cherry.description) {
            desc.innerHTML = `<em class="yt-meta__data">${dict('view/noDesc')}</em>`
            return desc
        }
        desc.innerHTML = cherry.description

        desc.querySelectorAll('a[data-timestamp]')
            .forEach(el => {
                el.onclick = function (event) {
                    const frame = yt.iframe || document.getElementById('yt-iframe')
                    if (!frame) return
                    event.preventDefault()
                    const url = new URL(frame.src)
                    url.searchParams.set('start', +el.dataset.timestamp)
                    frame.src = url

                    // Scroll to the iframe so the user sees it
                    window.scrollTo && window.scrollTo(0, 0)
                }
            })

        return desc
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
            tbody.append(tr)
        })
        div.append(table)
        return div
    } 

    function cherryPickProperties(videoInfo = {}) {
        const vid = {}

        // Check media title (song title),
        // then check the microformat title (translated?)
        // then default the basic property
        vid.title =
            safeLookup(videoInfo.media, [yt.dict.propertyLookup.song]) ||
            safeLookup(videoInfo, ['player_response', 'microformat', 'playerMicroformatRenderer', 'title', 'simpleText']) ||
            videoInfo.title
        ;

        vid.id = videoInfo.video_id

        vid.author =
            safeLookup(videoInfo.media, [yt.dict.propertyLookup.artist]) ||
            safeLookup(videoInfo.player_response, ['videoDetails', 'author']) ||
            safeLookup(videoInfo.author, ['name'])
        ;
        
        vid.album = safeLookup(videoInfo, ['media', yt.dict.propertyLookup.album])

        if (vid.album && vid.author) {
            const params = new URLSearchParams(location.search)
            params.set('q', `${vid.author} ${vid.album}`)
            vid.albumUrl = `<a href="/search?${params}">${vid.album}</a>`
            params.set('q', vid.author)
            vid.artistUrl = `<a href="/search?${params}">${vid.author}</a>`
        }

        vid.license = safeLookup(videoInfo.media, [yt.dict.propertyLookup.license])

        vid.isUnlisted = !safeLookup(videoInfo.player_response, ['videoDetails', 'isCrawlable'])

        vid.isExplicit = !!safeLookup(videoInfo.media, [yt.dict.propertyLookup.explicit])

        vid.description = safeLookup(videoInfo.player_response, [
            'microformat', 'playerMicroformatRenderer', 'description', 'simpleText'
        ]) || videoInfo.description

        vid.description = _parseDescription(vid.description)

        vid.views = +safeLookup(videoInfo.player_response, ['videoDetails', 'viewCount'])

        vid.ldRatio = NaN


        if (safeLookup(videoInfo.player_response, ['videoDetails', 'allowRatings'])) {
            vid.ldRatio = guard(
                safeLookup(videoInfo.player_response, ['videoDetails', 'averageRating']),
                ld => ld / 5 * 100
            ) || NaN
        }



        return vid
    }

    function _parseDescription(desc = '') {
        return desc.replace(yt.regexps.url, match => {
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
            out += decodeURI((url.pathname !== '/' && url.pathname) || '')
            out += '</a>'
            return out
        })
        .replace(yt.regexps.hashtag, match => {
            const q = new URLSearchParams(location.search)
            q.set('q', match)
            return `<a href="/search?${q}">${match}</a>`
        })
        .replace(yt.regexps.timestamp, match => {
            const seconds = match.split(':')
                .reverse()
                .map((a, i) => +a * (60 ** i))
                .reduce((acc, v) => acc + v, 0)
            return `<a href="#" data-timestamp="${seconds}">${match}</a>`
        })
    }

    function _createMetaTag(innerHTML) {
        const span = document.createElement('span')
        span.classList.add('yt-meta__data')
        span.innerHTML = innerHTML
        return span
    }

})()
