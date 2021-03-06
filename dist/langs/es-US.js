"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  var _errors;

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
  var errors = (_errors = {}, _defineProperty(_errors, 0x0010, "Error del pedido (HTTP 400)"), _defineProperty(_errors, 0x0011, "Pedido vacío"), _defineProperty(_errors, 0x0012, "No se encontró"), _defineProperty(_errors, 0x0013, "Se denegó el pedido Cross-origin"), _defineProperty(_errors, 0x0014, "Demasiados pedidos (HTTP 429)"), _defineProperty(_errors, 0x0015, "Eres robot"), _defineProperty(_errors, 0x0030, "Error del lado del cliente"), _defineProperty(_errors, 0x0031, "Afirmación no cumplida"), _defineProperty(_errors, 0x0032, "El ID del video de YouTube is inválida"), _defineProperty(_errors, 0x0040, "API error"), _defineProperty(_errors, 0x0041, "Imposible conseguir los datos del video mediante ytdl-core"), _defineProperty(_errors, 0x0042, "Imposible completar la búsqueda mediante yt-search"), _defineProperty(_errors, 0x0043, "El ID del progreso de la descarga es inválida"), _defineProperty(_errors, 0x0044, "El ID del video de YouTube is inválida"), _defineProperty(_errors, 0x0045, "Formato de salida inválida"), _defineProperty(_errors, 0x0046, "No se proporcionó archivos de entrada"), _defineProperty(_errors, 0x0047, "Error al convertir el video"), _defineProperty(_errors, 0x0048, "Error al descargar el formato"), _defineProperty(_errors, 0x0050, "Error del lado del servidor"), _defineProperty(_errors, 0x0051, "Error del servidor inesperado"), _defineProperty(_errors, 0x0052, "Corte temporal (HTTP 503)"), _defineProperty(_errors, 0xba11ad, "Se suspendió el servicio"), _defineProperty(_errors, 0x0961, "L is real"), _defineProperty(_errors, 0x0539, "Depurando"), _errors);
  return {
    lang: 'es-US',
    welcome: {
      hi: "Hola. Desde aquí puedes descargar videos de YouTube en cualquier formato que deseas.",
      love: "\n                Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun.</a>\n            ",
      don8: "Si te gust\xF3 esta p\xE1gina, <a href=\"https://ko-fi.com/mindfulminun\" target=\"_blank\">c\xF3mprame&nbsp;un&nbsp;caf\xE9.</a>",
      source: "\n                <a href=\"https://github.com/MindfulMinun/yt-for-me\" target=\"_blank\">C\xF3digo&nbsp;fuente</a>\n            ",
      nojs: "\n                <p>Desafortunadamente, este sitio web requiere de <em>JavaScript</em>.\n                Sin este, se te ser\xE1 casi imposible navegar el internet.\n                Adem\xE1s, no podr\xE1s ver videos de YouTube ni aqu\xED ni all\xE1.</p>\n\n                <p>Hazte un favor y <a href=\"https://www.enable-javascript.com/es/\">habil\xEDtalo</a>.</p>\n            ",
      thanks: "\n                Algunos iconos fueron creados por\n                <a href=\"https://www.flaticon.com/authors/freepik\" title=\"Freepik\">Freepik</a>\n                mediante <a href=\"https://www.flaticon.com/\" title=\"Flaticon\">flaticon.com</a>.\n            ",
      home: "Inicio",
      vid: "¿Te puedo sugerir <a href=\"/VgUR1pna5cY\" data-random>un video</a>?",
      searchPre: "O busca lo que tu quieras:",
      searchPlaceholder: "Buscar",
      languageA11yLabel: "Idioma"
    },
    errors: {
      myFault: function myFault() {
        return "\n                <p>\n                    Si crees que me equivoqu\xE9 <em>yo</em>, entonces\n                    <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">h\xE1zmelo saber</a>\n                    (hablo espa\xF1ol)\n                </p>\n                <p>\n                    De lo contrario, <a href=\"/\">int\xE9ntalo de nuevo</a>\n                </p>\n            ";
      },
      error400: function error400(err) {
        return "\n                <div class=\"error\">\n                    <h2>\xA1Caray! \xA1Ocurri\xF3 un error!</h2>\n                    <p>Error: ".concat(errors[err.errCode] || err.error, " (c\xF3digo 0x").concat((err.errCode || 0).toString(16), ")</p>\n                    ").concat(err.error ? "\n                        <p>El servidor tambi\xE9n dijo: <samp>".concat(err.error, "</samp> (habla ingl\xE9s)</p>\n                    ") : '', "\n                    <p>Vuelve a cargar la p\xE1gina.</p>\n                    </div>\n            ");
      },
      searchErr: function searchErr(err) {
        return "\n                <div class=\"error\">\n                    <h2>\xA1Caray! Se me quebr\xF3 la lupa de b\xFAsqueda.</h2>\n                    <p>Ocurri\xF3 un error: ".concat(errors[err.errCode] || err.error, " (c\xF3digo 0x").concat((err.errCode || 0).toString(16), ")</p>\n                    ").concat(err.error ? "\n                        <p>El servidor tambi\xE9n dijo: <samp>".concat(err.error, "</samp> (habla ingl\xE9s)</p>\n                    ") : '', "\n                    <p>Vuelve a cargar la p\xE1gina.</p>\n                </div>\n            ");
      },
      idAssertionFailed: function idAssertionFailed(id) {
        return "\n                <h1>Esto no parece un video.</h1>\n                <p>\n                    Esta aplicaci\xF3n habla con YouTube para darte informaci\xF3n sobre ella,\n                    incluyendo c\xF3mo descargarla. Para eso, se necesita algunas letritas\n                    raras que identifican al video (el ID del video). Si est\xE1s en esta p\xE1gina, es que\n                    las letras est\xE1n mal. \xBFQuiz\xE1 te equivocaste al copiar el ID?\n                </p>\n                <p>\n                    Pero no te desanimes, puedes <a href=\"/\">intentarlo de nuevo</a>.\n                </p>\n            ";
      }
    },
    search: {
      searchTitle: function searchTitle(query) {
        return "".concat(query, " \u2022 yt-for-me");
      },
      resultsFor: function resultsFor(query) {
        return "Resultados para la b\xFAsqueda \u201C".concat(query, "\u201D");
      },
      loading: function loading(search) {
        return "Buscando resultados para \u201C".concat(search, "\u201D");
      },
      emptySearchTitle: "Busca algo",
      emptySearch: "Puedes usar la barra de arriba para buscar videos, <a data-random>como este.</a>",
      by: function by(author) {
        return "por ".concat(author);
      },
      views: function views(_views) {
        switch (_views) {
          case 0:
            return "Sin vistas :(";

          case 1:
            return "Una sola vista :O";

          default:
            return "".concat(numFormatter.format(_views), " vistas");
        }
      },
      relTime: function relTime(ago) {
        var arr = ago.split(/\s/);
        return "Hace ".concat(arr[0] === '1' ? 'un' : arr[0], " ").concat(relativeTimes[arr[1]]);
      },
      loadMore: "Cargar más resultados"
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
      },
      noDesc: function noDesc() {
        return "Sin descripción";
      }
    },
    dlForm: {
      label: "Descargar",
      howTo: "\n                Elige un formato de audio, un formato de video, y manda al servidor que\n                te los convierte en cualquier formato que deseas para luego descargarlo.\n                La tabla a continuaci\xF3n te ayudar\xE1 a escoger los formatos ideales.\n            ",
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
      percentage: function percentage(p) {
        return "".concat(Math.round(p * 100), "\u202F%");
      },
      idle: "Hasta ahora, no hay nada descargándose. Anda, ¡descarga un video!"
    },
    generic: {
      piracyNotice: "Descargar contenido sin el debido permiso de YouTube y del titular de derechos de autor es ilegal. Descargar contenido de YouTube va en contra de los <a href=\"https://www.youtube.com/t/terms#ad6952fd3c\">t\xE9rminos de servicio de YouTube.</a>",
      reportErrLabel: "Informar de un error"
    },
    propertyLookup: {
      song: "canción",
      album: "álbum",
      artist: "artista",
      license: "con_licencia_para_youtube_de",
      explicit: "advertencia_para_padres"
    },
    loadingBlobs: ["Cargando...", "Descargando los virus...", "ちょっと待って下さい", "bip bip bip cargando...", "Demorando un rato a ver si te enfadas...", "Ocurrió un error. Por favor espere 5 segundos.", "¿Listo?", "Durmiendo un rato...", "Ejecutando <code>setTimeout(render, 5000)</code>...", "Haciéndome un café...", "Dame un segundo, me acabo de levantar...", "Generando un blob...", "Llegando tarde a clases de nuevo...", "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>", "Si te gust\xF3 esta p\xE1gina, <a href=\"https://ko-fi.com/mindfulminun\" target=\"_blank\">c\xF3mprame&nbsp;un&nbsp;caf\xE9.</a>"]
  };
});