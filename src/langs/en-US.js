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
        timeStyle: "medium"
    })

    return {
        lang: 'en-US',
        welcome: {
            hi: "Hi there. This app lets you download videos from YouTube in any format you want. Give it a try.",
            love: `
                Made with &lt;3 by <a href="https://benjic.xyz" target="_blank">MindfulMinun.</a>
            `,
            don8: `If you like this website, <a href="https://ko-fi.com/mindfulminun" target="_blank">buy&nbsp;me&nbsp;a&nbsp;coffee.</a>`,
            source: `
                <a href="https://github.com/MindfulMinun/yt-for-me" target="_blank">Source</a>
            `,
            nojs: `
                <p>Unfortunately, this really cool website needs you to enable <em>JavaScript</em>.
                The internet won't stop asking you to enable it if you don't.
                But most importantly, you won't be able to watch YouTube videos. :(</p>
                
                <p>Do yourself a favor and <a href="https://www.enable-javascript.com/">enable it</a>.</p>
            `,
            home: "Home",
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
                    But cheer up, you can always <a href="/">try it again</a>.
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
                        return "One single view :O"
                    default:
                        return `${numFormatter.format(views)} views`
                }
            },
            metaPublished: date => `Published on ${dateFormatter.format(date)}`,
            metaAuthor: name => `by ${name}`,
            metaAlbumAuthor: (album, author) => `in ${author}’s album <em>${album}</em>`,
            metaLicense: lic => `℗ ${lic}`,
            cardAuthor: name => `by ${name}`,
            cardViews: views => `${views} views`,
            searchLabel: () => "Back to search"
        },
        dlForm: {
            label: "Download",
            howTo: `
                Choose an audio format, a video format, and request the server to 
                convert them into whatever format you want.
                The table below will help you choose the best formats.
            `,
            audioLabel: "Audio",
            videoLabel: "Video",
            outLabel: "Output",
            dlLabel: "Convert",
            kind: {
                audio: "Audio",
                video: "Video",
                noAudio: "No audio",
                noVideo: "No video",
                onlyAudio: "Only audio",
                onlyVideo: "Only video",
                vidOrBoth: "Only video or both"
            },
            qualityHelper: (quality, label) => {
                return {
                    AUDIO_QUALITY_HIGH: `High (${label}kbps)`,
                    AUDIO_QUALITY_MEDIUM: `Medium (${label}kbps)`,
                    AUDIO_QUALITY_LOW: `Low (${label}kbps)`,
                    hd2160: `Very high (${label} 4K)`,
                    hd1440: `Very high (${label} HD)`,
                    hd1080: `High (${label} HD)`,
                    hd720: `Medium (${label} HD)`,
                    large: `Low (${label})`,
                    medium: `Low (${label})`,
                    small: `Low (${label})`,
                    tiny: `Low (${label})`
                }[quality] || quality
            },
            tableHeaders: {
                kind: "Kind",
                itag: "ID",
                encoding: "Encoding",
                codecs: "Codecs",
                container: "Container",
                resolution: "Resolution",
                quality: "Quality",
                sampR8: "Sampling rate"
            }
        },
        dlSheet: {
            labelDefault: "Downloads",
            dlLabel: "Download",
            states: {
                starting: "Starting...",
                downloading: "Downloading...",
                converting: "Converting...",
                done: "Conversion successful!"
            },
            percentage: (p) => `${Math.round(p * 100)}%`,
            idle: "There’s nothing being downloaded at the moment. Go ahead, download a video!"
        },
        generic: {
            piracyNotice: `Downloading content without the written consent of both YouTube and the content’s copyright owner is illegal. Downloading content off of YouTube goes against the <a href="https://www.youtube.com/t/terms#ad6952fd3c">YouTube Terms of Service.</a>`,
            reportErrLabel: 'Report an error'
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
            "stop piracy",
            "making SwuM type beats",
            "<a href=\"https://ytmp3.cc/\" target=\"_blank\">ytmp3.cc</a>",
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
