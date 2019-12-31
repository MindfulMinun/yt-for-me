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
            hi: "Hola. Desde aquí puedes descargar videos de YouTube en cualquier formato que deseas.",
            love: "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a> • <a href=\"https://github.com/MindfulMinun/yt-for-me\" target=\"_blank\">Código fuente</a>",
            nojs: `
                <p>Desafortunadamente, este sitio web requiere de <em>JavaScript</em>.
                Sin este, se te será casi imposible navegar el internet.
                Además, no podrás ver videos de YouTube ni aquí ni allá.</p>

                <p>Hazte un favor y <a href="https://www.enable-javascript.com/es/">habilítalo</a>.</p>
            `,
            vid: "¿Te puedo sugerir <a href=\"/VgUR1pna5cY\" data-random>un video</a>?",
            searchPre: "O busca lo que tu quieras:",
            searchPlaceholder: "Buscar",
            languageA11yLabel: "Idioma"
        },
        errors: {
            error400: err => `
                <h1>Ay caray, ¡¡un error nivel 400!!</h1>
                <p>El servidor se enojó y me dijo: <samp>${err}</samp> (habla inglés)</p>
                <p>
                    Parece que el video ya no existe o no está disponible por alguna razón.
                    Esto suele pasar de vez en cuando.
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
                    Esta aplicación habla con YouTube para darte información sobre ella,
                    incluyendo cómo descargarla. Para eso, se necesita algunas letritas
                    raras que identifican al video (el ID del video). Si estás en esta página, es que
                    las letras están mal. ¿Quizá te equivocaste al copiar el ID?
                </p>
                <p>
                    Pero no te desanimes, puedes <a href="/">intentarlo de nuevo</a>.
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
            iframeA11yLabel: title => `${title} - Reproductor de YouTube`,
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
            metaAlbumAuthor: (album, author) => `en el álbum <em>${album}</em> de ${author}`,
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
                    // case !/K$/i.test(views):
                    //     return `${views.replace(/K$/i, 'mil')} vistas`
                    default:
                        return `${views} vistas`
                }
            },
            searchLabel: () => "Regresar a la búsqueda"
        },
        dlForm: {
            label: "Descargar",
            howTo: `
                Elige un formato de audio, un formato de video, y manda al servidor que
                te los convierte en cualquier formato que deseas para luego descargarlo.
                La tabla a continuación te ayudará a escoger los formatos ideales.
            `,
            audioLabel: "Audio",
            videoLabel: "Video",
            outLabel: "Salida",
            dlLabel: "Convertir",
            kind: {
                audio: "Audio",
                video: "Video",
                noAudio: "Sin audio",
                noVideo: "Sin video",
                onlyAudio: "Solo audio",
                onlyVideo: "Solo video",
                vidOrBoth: "Solo video o ambos"
            },
            qualityHelper: (quality, label) => {
                return {
                    AUDIO_QUALITY_HIGH: `Alta (${label}kbps)`,
                    AUDIO_QUALITY_MEDIUM: `Regular (${label}kbps)`,
                    AUDIO_QUALITY_LOW: `Baja (${label}kbps)`,
                    hd2160: `Altísima (${label} 4K)`,
                    hd1440: `Muy alta (${label} HD)`,
                    hd1080: `Alta (${label} HD)`,
                    hd720: `Regular (${label} HD)`,
                    large: `Baja (${label})`,
                    medium: `Baja (${label})`,
                    small: `Baja (${label})`,
                    tiny: `Baja (${label})`
                }[quality] || quality
            },
            tableHeaders: {
                kind: "Tipo",
                itag: "ID",
                encoding: "Codificación",
                codecs: "Códecs",
                container: "Contenedor",
                resolution: "Resolución",
                quality: "Calidad",
                sampR8: "Freq. de muestreo"
            }
        },
        dlSheet: {
            labelDefault: "Descargas y conversión",
            dlLabel: "Descargar",
            states: {
                starting: "Iniciando...",
                downloading: "Descargando...",
                converting: "Convertiendo al formato deseado...",
                done: "Se completó la descarga con éxito."
            },
            percentage: (p) => `${Math.round(p * 100)}\u202F%`,
            idle: "Hasta ahora, no hay nada descargándose. Anda, ¡descarga un video!"
        },
        generic: {
            piracyNotice: `Descargar contenido sin el debido permiso de YouTube y del titular de derechos de autor es ilegal. Descargar contenido de YouTube va en contra de los <a href="https://www.youtube.com/t/terms#ad6952fd3c">términos de servicio de YouTube.</a>`,
            reportErrLabel: "Informar de un error"
        },
        propertyLookup: {
            song: "canción",
            album: "álbum",
            artist: "artista",
            license: "con_licencia_para_youtube_de",
            explicit: "advertencia_para_padres"
        },
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
