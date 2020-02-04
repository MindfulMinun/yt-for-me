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
            hi: "welcome/hi",
            nojs: "welcome/nojs",
            thanks: "welcome/thanks",
            home: "welcome/home",
            vid: "welcome/vid",
            searchPre: "welcome/searchPre",
            searchPlaceholder: "welcome/searchPlaceholder",
            languageA11yLabel: "welcome/languageA11yLabel"
        },
        propertyLookup: {
            // These can't be left out.
            song: "song",
            album: "album",
            artist: "artist",
            license: "licensed_to_youtube_by",
            explicit: "parental_warning"
        },
        loadingBlobs: [
            "loadingBlobs/0",
            "¡Ponme a prueba, eh!",
            "henlo developer i see you're currently debugging.",
            "<code>debugger;</code>"
        ]
    };
});
