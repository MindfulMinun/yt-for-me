(function (root, factory) {
    // UMD: https://git.io/fjxpW
    if ((typeof module !== "undefined") && module.exports) {
        module.exports = factory()
    } else if (root.yt) {
        root.yt.dict = factory()
    } else {
        throw Error("UMD exporting failed")
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const numFormatter = new Intl.NumberFormat('en-US', { style: 'decimal' })
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "utc"
    })

    return {
        lang: 'en-US',
        welcome: {
            hi: "Hi there. This app steals videos from YouTube. Give it a try.",
            love: "Made with &lt;3 by <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>",
            nojs: `
                <p>Unfortunately, this really cool website needs you to enable <em>JavaScript</em>.
                The internet won't stop asking you to enable it if you don't.
                But most importantly, you won't be able to watch YouTube videos. :(</p>
                
                <p>Do yourself a favor and <a href="https://www.enable-javascript.com/">enable it</a>.</p>
                `,
            vid: "Might I suggest <a href=\"/VgUR1pna5cY\" data-random>a video</a>?",
            searchPre: "Or search for your own:",
            searchPlaceholder: "Search",
            languageA11yLabel: "Language"
        },
        errors: {
            error400: err => `
                <h1>Oh dang, a level 400 error!!1!!!</h1>
                <p>The server says: <samp>${err}</samp></p>
                <p>
                    It looks like you did something wrong,
                    that video probably doesn’t exist.
                </p>
                <p>
                    If you think <em>i</em> fucked up, then
                    <a href="https://benjic.xyz/#contact" target="_blank">let me know</a>
                </p>
                <p>
                    Otherwise, <a href="/">start over</a>
                </p>
            `,
            idAssertionFailed: id => `
                <h1>${id || 'This'} doesn't seem to be a video.</h1>
                <p>
                    Look, this app supposedly talks to YouTube.
                    And for that, the mumbo jumbo after forward slash in the URL corresponds to a specific video on YouTube. Maybe you just copied the ID wrong?
                </p>
                <p>
                    Mantén la frente en alto, siempre podrás <a href="/">intentarlo de nuevo</a>.
                </p>
            `
        },
        search: {
            resultsFor: () => (text, render) => `Results for “${render(text)}”`,
            emptySearch: () => `It seems like you didn't search for anything. Are you not in the mood to watch anything? You can try again with the search bar above.`,
            count: () => (text, render) => `${render(text)} views`,
            by: () => (text, render) => `by ${render(text)}`,
            views: () => (text, render) => {
                const views = render(text)
                    
                switch (views) {
                    case "0":
                        return "No views :("
                    case "1":
                        return "One singular view :O"
                    default:
                        return `${numFormatter.format(views)} views`
                }
            },
            relTime: () => (text, render) => render(text) // It's in English by default
        },
        view: {
            dlSummaryLabel: () => "Download",
            dlSummaryPara: () => `
                Links are sorted by quality. For the 100% best experience, I recommend downloading the highest quality video, highest quality audio, and merge them using something like <code>ffmpeg</code>.
            `,
            dlListBoth: () => "Video + Audio",
            dlListAudio: () => "Audio only",
            dlListVideo: () => "Video only",
            iframeA11yLabel: title => `${title} - Embedded YouTube player`,
            metaViews: views => {
                switch (views) {
                    case 0:
                        return "No views :("
                    case 1:
                        return "One singular view :O"
                    default:
                        return `${numFormatter.format(views)} views`
                }
            },
            metaPublished: date => `Published on ${dateFormatter.format(date)}`,
            metaAuthor: name => `by ${name}`,
            metaAlbum: album => `in ${album}`,
            metaLicense: lic => `℗ ${lic}`,
            cardAuthor: name => `by ${name}`,
            cardViews: views => `${views} views`,
            searchLabel: () => "Back to search"
        },
        propertyLookup: {
            song: "song",
            album: "album",
            artist: "artist",
            license: "licensed_to_youtube_by",
            explicit: "parental_warning"
        },
        loadingBlobs: [
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
    };
});
