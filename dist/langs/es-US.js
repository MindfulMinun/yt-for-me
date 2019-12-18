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
        return "\n                <h1>Ay car\xE1mba, \xA1\xA1un error nivel 400!!</h1>\n                <p>El servidor se enoj\xF3 y me dijo: <samp>".concat(err, "</samp> (habla ingl\xE9s)</p>\n                <p>\n                    Parece que te equivocaste, ese video probablemente\n                    no existe.\n                </p>\n                <p>\n                    Si crees que me equivoqu\xE9 <em>yo</em>, entonces\n                    <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">h\xE1zmelo saber</a>\n                    (hablo espa\xF1ol)\n                </p>\n                <p>\n                    De lo contrario, <a href=\"/\">int\xE9ntalo de nuevo</a>\n                </p>\n            ");
      },
      idAssertionFailed: function idAssertionFailed(id) {
        return "\n                <h1>".concat(id || 'Esto', " no parece ser un video.</h1>\n                <p>\n                    Se supone que esta aplicaci\xF3n habla con YouTube.\n                    Para eso, se supone que las letritas despu\xE9s de la barra en la direcci\xF3n corresponden a un video de YouTube. \xBFQuiz\xE1 te equivocaste al copiar el ID?\n                </p>\n                <p>\n                    Mant\xE9n la frente en alto, siempre podr\xE1s <a href=\"/\">intentarlo de nuevo</a>.\n                </p>\n            ");
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
    propertyLookup: {
      song: "canción",
      album: "álbum",
      artist: "artista",
      license: "con_licencia_para_youtube_de",
      explicit: "advertencia_para_padres"
    },
    dlForm: {
      label: "Descargar",
      howto: "\n                Elige un formato de audio, un formato de video, y manda a que el servidor\n                te los convierte en cualquier formato que deseas para luego descargarlo.\n                La tabla a continuaci\xF3n te ayudar\xE1 a escoger los formatos ideales.\n            ",
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
        kind: 'Tipo',
        itag: 'Valor itag',
        encoding: 'Codificación',
        container: 'Contenedor',
        resolution: 'Resolución',
        sampR8: 'Freq. de muestreo'
      }
    },
    dlSheet: {
      labelDefault: "Descargas",
      idle: "Hasta ahora, no hay nada descargándose. Anda, ¡descarga un video!"
    },
    loadingBlobs: ["Cargando...", "Descargando los virus...", "ちょっと待って下さい", "bip bip bip cargando...", "Demorando un rato a ver si te enfadas...", "Ocurrió un error. Por favor espere 5 segundos.", "¿Listo?", "Durmiendo un rato...", "Ejecutando <code>setTimeout(render, 5000)</code>...", "Haciéndome un café...", "Dame un segundo, me acabo de levantar...", "Generando un blob...", "Llegando tarde a clases de nuevo...", "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"]
  };
});