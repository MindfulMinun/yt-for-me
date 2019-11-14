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
  var numFormatter = new Intl.NumberFormat('es-MX', {
    style: 'decimal'
  });
  var dateFormatter = new Intl.DateTimeFormat('es-MX', {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "utc"
  });
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
    lang: 'es-MX',
    welcome: {
      hi: "Hola. Desde aquí puedes robarte videos de YouTube.",
      love: "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>",
      nojs: "\n                <p>Desafortunadamente, esta p\xE1gina muy padre requiere de <em>JavaScript</em>.\n                Sin esta, se te ser\xE1 casi imposible navegar las redes sin que te exigen que la prendas.\n                Adem\xE1s, no podr\xE1s ver videos de YouTube ni aqu\xED ni all\xE1.</p>\n\n                <p>Hazte un favorzote y <a href=\"https://www.enable-javascript.com/es/\">habil\xEDtalo</a>.</p>\n            ",
      vid: "¿Te puedo sugerir <a href=\"/VgUR1pna5cY\" data-random>un video</a>?",
      searchPre: "O busca lo que tu quieras:",
      searchPlaceholder: "Búsqueda"
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
          return "\n                Resultados para la b\xFAsqueda \u201C".concat(render(text), "\u201D\n            ");
        };
      },
      count: function count() {
        return function (text, render) {
          return "".concat(render(text), " vistas");
        };
      },
      by: function by() {
        return function (text, render) {
          return "por ".concat(render(text));
        };
      },
      relTime: function relTime() {
        return function (text, render) {
          var arr = render(text).split(/\s/);
          return "Hace ".concat(arr[0] === 1 ? 'un' : arr[0], " ").concat(relativeTimes[arr[1]]);
        };
      }
    },
    view: {
      dlSummaryLabel: function dlSummaryLabel() {
        return "Descargar";
      },
      dlSummaryPara: function dlSummaryPara() {
        return "\n                Los enlaces est\xE1n en orden de mayor a peor calidad. Para obtener la mejor calidad, recomiendo descargar el video de mejor calidad, el audio de mejor calidad, y usar una herramienta como <code>ffmpeg</code> para unirlos.\n            ";
      },
      dlListBoth: function dlListBoth() {
        return "Video y audio";
      },
      dlListAudio: function dlListAudio() {
        return "Solo audio";
      },
      dlListVideo: function dlListVideo() {
        return "Solo video";
      },
      iframeA11yLabel: function iframeA11yLabel(title) {
        return "".concat(title, " - Repdroductor YouTube");
      },
      metaViews: function metaViews(views) {
        return "".concat(numFormatter.format(views), " vistas");
      },
      metaPublished: function metaPublished(date) {
        return "Publicado el ".concat(dateFormatter.format(date));
      },
      metaAuthor: function metaAuthor(name) {
        return "por ".concat(name);
      },
      cardAuthor: function cardAuthor(name) {
        return "por ".concat(name);
      },
      cardViews: function cardViews(views) {
        return "".concat(views.replace(/([a-z]+)/i, ' $1'), " vistas");
      }
    },
    loadingBlobs: ["Cargando...", "Descargando los virus...", "ちょっと待って下さい", "bip bip bip cargando...", "Demorando un rato a ver si te enfadas...", "Ocurrió un error. Por favor espere 5 segundos.", "¿Listo?", "Durmiendo un rato...", "Executando <code>setTimeout(render, 5000)</code>...", "Haciéndome un café...", "Dame un segundo, me acabo de levantar...", "Generando un blob...", "Llegando tarde a clases de nuevo...", "Hecho con &lt;3 por <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"]
  };
});