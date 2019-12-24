"use strict";

(function (root, factory) {
  // UMD: https://git.io/fjxpW
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else if (root.yt) {
    root.yt.dict = factory();
  } else {
    throw Error("UMD exporting failed");
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  var numFormatter = new Intl.NumberFormat('es-US', {
    style: 'decimal'
  }); // const dateFormatter = new Intl.DateTimeFormat('es-US', {
  //     dateStyle: "medium",
  //     timeStyle: "medium"
  // })
  // dateFormatter.format(new Date)

  function dateFormatter(date) {
    date = new Date(date);
    var out = '';
    out += date.toLocaleDateString('es-US', {
      dateStyle: "medium"
    });
    var right = date.toLocaleTimeString('es-US', {
      timeStyle: "medium"
    });
    out += " a la".concat(/^(0?1):/.test(right) ? '' : 's', " ");
    out += right;
    return out;
  }

  var relativeTimes = {
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
  };
  return {
    lang: 'es-US',
    welcome: {
      hi: "Hola. Desde aquí puedes robarte videos de YouTube.",
      love: "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a> • <a href=\"https://github.com/MindfulMinun/yt-for-me\" target=\"_blank\">Código fuente</a>",
      nojs: "\n                <p>Desafortunadamente, esta p\xE1gina muy padre requiere de <em>JavaScript</em>.\n                Sin ella, se te ser\xE1 casi imposible navegar las redes sin que te exigen que la prendas.\n                Adem\xE1s, no podr\xE1s ver videos de YouTube ni aqu\xED ni all\xE1.</p>\n\n                <p>Hazte un favor y <a href=\"https://www.enable-javascript.com/es/\">habil\xEDtalo</a>.</p>\n            ",
      vid: "¿Te puedo sugerir <a href=\"/VgUR1pna5cY\" data-random>un video</a>?",
      searchPre: "O busca lo que tu quieras:",
      searchPlaceholder: "Buscar",
      languageA11yLabel: "Idioma"
    },
    errors: {
      error400: function error400(err) {
        return "\n                <h1>Ay caray, \xA1\xA1un error nivel 400!!</h1>\n                <p>El servidor se enoj\xF3 y me dijo: <samp>".concat(err, "</samp> (habla ingl\xE9s)</p>\n                <p>\n                    Parece que el video ya no existe o no est\xE1 disponible por alguna raz\xF3n.\n                    Esto suele pasar de vez en cuando.\n                </p>\n                <p>\n                    Si crees que me equivoqu\xE9 <em>yo</em>, entonces\n                    <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">h\xE1zmelo saber</a>\n                    (hablo espa\xF1ol)\n                </p>\n                <p>\n                    De lo contrario, <a href=\"/\">int\xE9ntalo de nuevo</a>\n                </p>\n            ");
      },
      idAssertionFailed: function idAssertionFailed(id) {
        return "\n                <h1>".concat(id || 'Esto', " no parece ser un video.</h1>\n                <p>\n                    Esta aplicaci\xF3n habla con YouTube para darte informaci\xF3n sobre ella,\n                    incluyendo c\xF3mo descargarla. Para eso, se necesita algunas letritas\n                    raras que identifican al video (el ID del video). Si est\xE1s en esta p\xE1gina, es que\n                    las letras est\xE1n mal. \xBFQuiz\xE1 te equivocaste al copiar el ID?\n                </p>\n                <p>\n                    Pero no te desanimes, puedes <a href=\"/\">intentarlo de nuevo</a>.\n                </p>\n            ");
      }
    },
    search: {
      resultsFor: function resultsFor() {
        return function (text, render) {
          return "Resultados para la b\xFAsqueda \u201C".concat(render(text), "\u201D");
        };
      },
      emptySearch: function emptySearch() {
        return "Parece que no buscaste nada. \xBFAcaso no quieres ver nada? Si te cambias de opini\xF3n, puedes intentarlo de nuevo con la barra de arriba.";
      },
      by: function by() {
        return function (text, render) {
          return "por ".concat(render(text));
        };
      },
      views: function views() {
        return function (text, render) {
          var views = render(text);

          switch (views) {
            case "0":
              return "Sin vistas :(";

            case "1":
              return "Una sola vista :O";

            default:
              return "".concat(numFormatter.format(views), " vistas");
          }
        };
      },
      relTime: function relTime() {
        return function (text, render) {
          var arr = render(text).split(/\s/);
          return "Hace ".concat(arr[0] === '1' ? 'un' : arr[0], " ").concat(relativeTimes[arr[1]]);
        };
      }
    },
    view: {
      iframeA11yLabel: function iframeA11yLabel(title) {
        return "".concat(title, " - Reproductor de YouTube");
      },
      metaViews: function metaViews(views) {
        switch (views) {
          case 0:
            return "Sin vistas :(";

          case 1:
            return "Una sola vista :O";

          default:
            return "".concat(numFormatter.format(views), " vistas");
        }
      },
      metaPublished: function metaPublished(date) {
        return "Publicado el ".concat(dateFormatter(date));
      },
      metaAuthor: function metaAuthor(name) {
        return "por ".concat(name);
      },
      metaAlbumAuthor: function metaAlbumAuthor(album, author) {
        return "en el \xE1lbum <em>".concat(album, "</em> de ").concat(author);
      },
      metaLicense: function metaLicense(lic) {
        return "\u2117 ".concat(lic);
      },
      cardAuthor: function cardAuthor(name) {
        return "por ".concat(name);
      },
      cardViews: function cardViews(views) {
        switch (false) {
          case views !== "0":
            return "Sin vistas";

          case views !== "1":
            return "Una sola vista";

          case !/[MB]$/i.test(views):
            return "".concat(views, " de vistas");
          // case !/K$/i.test(views):
          //     return `${views.replace(/K$/i, 'mil')} vistas`

          default:
            return "".concat(views, " vistas");
        }
      },
      searchLabel: function searchLabel() {
        return "Regresar a la búsqueda";
      }
    },
    dlForm: {
      label: "Descargar",
      howTo: "\n                Elige un formato de audio, un formato de video, y manda al servidor que\n                te los convierte en cualquier formato que deseas para luego descargarlo.\n                La tabla a continuaci\xF3n te ayudar\xE1 a escoger los formatos ideales.\n                <br>\n                (Y si no sabes cuales escoger, pues elige la primera selecci\xF3n de ambas.)\n            ",
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
      labelDefault: "Descargas",
      idle: "Hasta ahora, no hay nada descargándose. Anda, ¡descarga un video!"
    },
    generic: {
      qualityHelper: function qualityHelper(quality, label) {
        return {
          AUDIO_QUALITY_HIGH: "Alta (".concat(label, "kbps)"),
          AUDIO_QUALITY_MEDIUM: "Regular (".concat(label, "kbps)"),
          AUDIO_QUALITY_LOW: "Baja (".concat(label, "kbps)"),
          hd2160: "Alt\xEDsima (".concat(label, " 4K)"),
          hd1440: "Muy alta (".concat(label, " HD)"),
          hd1080: "Alta (".concat(label, " HD)"),
          hd720: "Regular (".concat(label, " HD)"),
          large: "Baja (".concat(label, ")"),
          medium: "Baja (".concat(label, ")"),
          small: "Baja (".concat(label, ")"),
          tiny: "Baja (".concat(label, ")")
        }[quality] || quality;
      },
      piracyNotice: "Descargar contenido sin el debido permiso de YouTube y del titular de derechos de autor es ilegal. Descargar contenido de YouTube va en contra de los <a href=\"https://www.youtube.com/t/terms#ad6952fd3c\">t\xE9rminos de servicio de YouTube.</a>"
    },
    propertyLookup: {
      song: "canción",
      album: "álbum",
      artist: "artista",
      license: "con_licencia_para_youtube_de",
      explicit: "advertencia_para_padres"
    },
    loadingBlobs: ["Cargando...", "Descargando los virus...", "ちょっと待って下さい", "bip bip bip cargando...", "Demorando un rato a ver si te enfadas...", "Ocurrió un error. Por favor espere 5 segundos.", "¿Listo?", "Durmiendo un rato...", "Ejecutando <code>setTimeout(render, 5000)</code>...", "Haciéndome un café...", "Dame un segundo, me acabo de levantar...", "Generando un blob...", "Llegando tarde a clases de nuevo...", "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"]
  };
});