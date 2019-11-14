const dict = {
    LOCALE: 'en',
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
        `
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
        metaViews: views => `${views} views`,
        metaPublished: date => `Published on ${date}`,
        metaAuthor: name => `by ${name}`,
        cardAuthor: name => `by ${name}`,
        cardViews: views => `${views} views`
    }
}
