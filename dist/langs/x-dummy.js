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
  var numFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal'
  });
  var dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: "medium",
    timeStyle: "medium"
  });
  return {
    lang: 'en-US',
    welcome: {
      hi: "welcome/hi",
      love: "welcome/love",
      nojs: "welcome/nojs",
      vid: "welcome/vid",
      searchPre: "welcome/searchPre",
      searchPlaceholder: "welcome/searchPlaceholder",
      languageA11yLabel: "welcome/languageA11yLabel"
    },
    search: {
      resultsFor: function resultsFor() {
        return function () {
          return "search/resultsFor";
        };
      },
      emptySearch: function emptySearch() {
        return "search/emptySearch";
      },
      count: function count() {
        return function () {
          return "search/count";
        };
      },
      by: function by() {
        return function () {
          return "search/by";
        };
      },
      views: function views() {
        return function () {
          return "search/views";
        };
      },
      relTime: function relTime() {
        return function () {
          return "search/relTime";
        };
      } // resultsFor: () => (text, render) => `search/resultsFor “${render(text)}”`,
      // emptySearch: () => `search/emptySearch`,
      // count: () => (text, render) => `search/count ${render(text)}`,
      // by: () => (text, render) => `search/by ${render(text)}`,
      // views: () => (text, render) => `search/views ${render(text)}`,
      // relTime: () => (text, render) => `search/relTime ${render(text)}`

    },
    propertyLookup: {
      // These can't be left out. They're used to 
      song: "song",
      album: "album",
      artist: "artist",
      license: "licensed_to_youtube_by",
      explicit: "parental_warning"
    },
    loadingBlobs: ["loadingBlobs/0", "¡Ponme a prueba, eh!", "henlo developer i see you're currently debugging.", "<code>debugger;</code>"]
  };
});