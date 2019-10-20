(function() {
    'use strict';
    window.vid = {};
    const cont = document.querySelector('.container')
    const LOCALE = 'en-US'
    const countF = new Intl.NumberFormat(LOCALE, {style: 'decimal'})
    const dateF = new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "medium",
        timeStyle: "medium"
    })

    const loadingBlobs = [
        "Loading...",
        "Stealing your YT credentials...",
        "ちょっと待って下さい",
        "beep boop boop loading...",
        "i'm not sentient, i promise!!!",
        "An exception has occurred. Please wait five seconds.",
        "Ready?",
        "Sleeping with your sister...",
        "Calling <code>setTimeout(render, 5000)</code>...",
        "Brewing some coffee...",
        "Give me a minute, I just woke up...",
        "Generating a blob...",
        "Showing up late to class yet again...",
        "Made with &lt;3 by <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"
    ]
    const vids = [
        '1iKZhsc8WGs', // Moe Shop - Charm
        '0E5l2GHBxB8', // Stal
        // 'yD2FSwTy2lw', // No one's around to help
        'VgUR1pna5cY', // Moe Shop - Natural
        'dQw4w9WgXcQ'  // get rickrolled lol
    ]

    if (location.pathname === '/') {
        cont.innerHTML = `
            <h1>yt-for-me</h1>
            <p>Hi there. This app steals videos from YouTube. Give it a try.</p>
            <p>Might I suggest <a href="/${choose(vids)}">a video</a>?</p>
            <p>
            Or search for your own: 
            <input type="text" placeholder="search" class="yt-input">
            </p>
        `

        cont.querySelector('input').addEventListener('keypress', event => {
            if (event.key === "Enter") {
                const test = /([a-zA-Z0-9\-\_]{11})/.exec(event.target.value)
                guard(test && test[1], id => {
                    window.location.href += id
                })
            }
        })
        return
    } else {
        cont.innerHTML = `
            <p class="loading">${choose(loadingBlobs)}</p>
        `
    }

    fetch(`/api/info?id=${location.pathname.substr(1)}`)
        .then(res => res.json())
        .then(json => json.error ? Promise.reject(json) : json)
        .then(function (info) {
            document.title = `${info.title} • yt-for-me`
            cont.innerHTML = ''
            cont.appendChild(genView(info))
            window.vid = info
            console.log('Video info (window.vid):', info)
        })
        .catch(function (err) {
            console.log(err)
            cont.innerHTML = `
                <h1>oh no a level 400 error</h1>
                <p>The server says: <samp>${err.error}</samp></p>
                <p>
                    you did something wrong, that video probably doesn’t exist.
                </p>
                <p>
                    if you think <em>i</em> fucked up, then
                    <a href="https://benjic.xyz/#contact" target="_blank">let me know</a>
                </p>
                <p>
                    otherwise, <a href="/">start over</a>
                </p>
            `
        })

    function genView(info) {
        const view = document.createElement('div')
        const ps = info.player_response || {}
        view.classList.add('view')

    
        view.innerHTML = `
            <div class="yt">
                <details class="yt-dl">
                    <summary>Download</summary>
                    <p>Links are sorted by quality. For the 100% best experience, I recommend downloading the highest quality video, highest quality audio, and merge them using something like <code>ffmpeg</code>.</p>
                    <div class="yt-dl__lists">
                        <ul>
                            <li><strong>Video + Audio</strong></li>
                        </ul>
                        <ul>
                            <li><strong>Audio only</strong></li>
                        </ul>
                        <ul>
                            <li><strong>Video only</strong></li>
                        </ul>
                    </div>
                </details>
                <div class="yt-embed">
                    <iframe
                        title="${info.title} - Embedded YouTube player"
                        width="853" height="480" frameborder="0"
                        src="https://www.youtube.com/embed/${info.video_id}?rel=0"
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
                        countF.format(
                            info.player_response.videoDetails.viewCount
                        )
                    } views • Published on ${dateF.format(info.published)}</span>
                    <span class="yt-meta__data">by ${
                        (info.media && info.media.artist) || info.author.name
                    }</span>
                </div>
                <div class="yt-desc">${
                    guard(ps.microformat, mf => guard(
                        mf.playerMicroformatRenderer,
                        pmr => guard(
                            pmr.description, desc => desc.simpleText
                        )
                    )) || info.transform
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
            // f for format
            let li = document.createElement('li')
            ,   inner = ''
            ,   dlList;
    
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
        
        info.related_videos.forEach(function (vid, i) {
            if (vid.list) return;
            let card = document.createElement('a')
            card.href = '/' + vid.id
            card.classList.add('yt-card')
            // card.style.backgroundImage = `url(${vid.iurlhq})`
            card.style.backgroundImage = `
                linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)),
                url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)
            `
            card.innerHTML = `
                <div class="yt-card--info">
                    <strong>${vid.title}</strong>
                    <span>by ${vid.author}</span>
                    <span>${vid.short_view_count_text} views</span>
                </div>
            `
            rel.appendChild(card);
        })
    
        console.log(view)
    
        return view
    }

}());

/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Decaffeinate-style guard
 * @param {*} what - The thing that might be null or undefined
 * @param {function} mod - The modifier
 * @returns {*} The return value of your function or undefined if nullish
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */
function guard(what, mod) {
    return (typeof what !== 'undefined' && what !== null) ? mod(what) : void 0;
}
