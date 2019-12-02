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
    const numFormatter = new Intl.NumberFormat('es-US', { style: 'decimal' })
    // const dateFormatter = new Intl.DateTimeFormat('es-US', {
    //     dateStyle: "medium",
    //     timeStyle: "medium"
    // })
    // dateFormatter.format(new Date)

    function dateFormatter(date) {
        date = new Date(date)
        let out = ''
        out += date.toLocaleDateString('es-US', {
            dateStyle: "medium"
        })
        let right = date.toLocaleTimeString('es-US', {
            timeStyle: "medium"
        })

        out += ` a la${/^(0?1):/.test(right) ? '' : 's'} `
        out += right
        return out
    }

    const relativeTimes = {
        minute: "minuto",
        minutes: "minutos",
        hour: "hora",
        hours: "horas",
        day: "día",
        days: "días",
        week: "semana",
        weeks: "semanas",
        month: "mes",
        months: "meses",
        year: "año",
        years: "años"
    }

    return {
        lang: 'es-US',
        welcome: {
            hi: "Hola. Desde aquí puedes robarte videos de YouTube.",
            love: "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>",
            nojs: `
                <p>Desafortunadamente, esta página muy padre requiere de <em>JavaScript</em>.
                Sin esta, se te será casi imposible navegar las redes sin que te exigen que la prendas.
                Además, no podrás ver videos de YouTube ni aquí ni allá.</p>

                <p>Hazte un favorzote y <a href="https://www.enable-javascript.com/es/">habilítalo</a>.</p>
            `,
            vid: "¿Te puedo sugerir <a href=\"/VgUR1pna5cY\" data-random>un video</a>?",
            searchPre: "O busca lo que tu quieras:",
            searchPlaceholder: "Buscar",
            languageA11yLabel: "Idioma"
        },
        errors: {
            error400: err => `
                <h1>Ay carámba, ¡¡un error nivel 400!!</h1>
                <p>El servidor se enojó y me dijo: <samp>${err}</samp> (habla inglés)</p>
                <p>
                    Parece que te equivocaste, ese video probablemente
                    no existe.
                </p>
                <p>
                    Si crees que me equivoqué <em>yo</em>, entonces
                    <a href="https://benjic.xyz/#contact" target="_blank">házmelo saber</a>
                    (hablo español)
                </p>
                <p>
                    De lo contrario, <a href="/">inténtalo de nuevo</a>
                </p>
            `,
            idAssertionFailed: id => `
                <h1>${id || 'Esto'} no parece ser un video.</h1>
                <p>
                    Se supone que esta aplicación habla con YouTube.
                    Para eso, se supone que las letritas después de la barra en la dirección corresponden a un video de YouTube. ¿Quizá te equivocaste al copiar el ID?
                </p>
                <p>
                    Mantén la frente en alto, siempre podrás <a href="/">intentarlo de nuevo</a>.
                </p>
            `
        },
        search: {
            resultsFor: () => (text, render) => `Resultados para la búsqueda “${render(text)}”`,
            emptySearch: () => `Parece que no buscaste nada. ¿Acaso no quieres ver nada? Si te cambias de opinión, puedes intentarlo de nuevo con la barra de arriba.`,
            by: () => (text, render) => `por ${render(text)}`,
            views: () => (text, render) => {
                const views = render(text)
                switch (views) {
                    case "0":
                        return "Sin vistas :("
                    case "1":
                        return "Una sola vista :O"
                    default:
                        return `${numFormatter.format(views)} vistas`
                }
            },
            relTime: () => (text, render) => {
                let arr = render(text).split(/\s/)
                return `Hace ${arr[0] === '1' ? 'un' : arr[0]} ${relativeTimes[arr[1]]}`
            }
        },
        view: {
            dlSummaryLabel: () => "Descargar",
            dlSummaryPara: () => `
                Los enlaces están en orden de mayor a peor calidad. Para obtener la mejor calidad, recomiendo descargar el video de mejor calidad, el audio de mejor calidad, y usar una herramienta como <code>ffmpeg</code> para unirlos.
            `,
            dlListBoth: () => "Video y audio",
            dlListAudio: () => "Solo audio",
            dlListVideo: () => "Solo video",
            iframeA11yLabel: title => `${title} - Repdroductor YouTube`,
            metaViews: views => {
                switch (views) {
                    case 0:
                        return "Sin vistas :("
                    case 1:
                        return "Una sola vista :O"
                    default:
                        return `${numFormatter.format(views)} vistas`
                }
            },
            metaPublished: date => `Publicado el ${dateFormatter(date)}`,
            metaAuthor: name => `por ${name}`,
            metaAlbum: album => `en ${album}`,
            metaLicense: lic => `℗ ${lic}`,
            cardAuthor: name => `por ${name}`,
            cardViews: views => {
                switch (false) {
                    case views !== "0":
                        return "Sin vistas"
                    case views !== "1":
                        return "Una sola vista"
                    case !/[MB]$/i.test(views):
                        return `${views} de vistas`
                    default:
                        return `${views} vistas`
                }
            },
            searchLabel: () => "Regresar a la búsqueda"
        },
        propertyLookup: {
            song: "canción",
            album: "álbum",
            artist: "artista",
            license: "con_licencia_para_youtube_de",
            explicit: "advertencia_para_padres"
        },
        // render(text).replace(/(\d+),(\d+)/gi, '$1.$2')
        loadingBlobs: [
            "Cargando...",
            "Descargando los virus...",
            "ちょっと待って下さい",
            "bip bip bip cargando...",
            "Demorando un rato a ver si te enfadas...",
            "Ocurrió un error. Por favor espere 5 segundos.",
            "¿Listo?",
            "Durmiendo un rato...",
            "Ejecutando <code>setTimeout(render, 5000)</code>...",
            "Haciéndome un café...",
            "Dame un segundo, me acabo de levantar...",
            "Generando un blob...",
            "Llegando tarde a clases de nuevo...",
            "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"
        ]
    }
})