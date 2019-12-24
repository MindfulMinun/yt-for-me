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
      hi: "Hi there. This app steals videos from YouTube. Give it a try.",
      love: "Made with &lt;3 by <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a> • <a href=\"https://github.com/MindfulMinun/yt-for-me\" target=\"_blank\">Source</a>",
      nojs: "\n                <p>Unfortunately, this really cool website needs you to enable <em>JavaScript</em>.\n                The internet won't stop asking you to enable it if you don't.\n                But most importantly, you won't be able to watch YouTube videos. :(</p>\n                \n                <p>Do yourself a favor and <a href=\"https://www.enable-javascript.com/\">enable it</a>.</p>\n                ",
      vid: "Might I suggest <a href=\"/VgUR1pna5cY\" data-random>a video</a>?",
      searchPre: "Or search for your own:",
      searchPlaceholder: "Search",
      languageA11yLabel: "Language"
    },
    errors: {
      error400: function error400(err) {
        return "\n                <h1>Oh dang, a level 400 error!!1!!!</h1>\n                <p>The server says: <samp>".concat(err, "</samp></p>\n                <p>\n                    It looks like you did something wrong,\n                    that video probably doesn\u2019t exist.\n                </p>\n                <p>\n                    If you think <em>i</em> fucked up, then\n                    <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">let me know</a>\n                </p>\n                <p>\n                    Otherwise, <a href=\"/\">start over</a>\n                </p>\n            ");
      },
      idAssertionFailed: function idAssertionFailed(id) {
        return "\n                <h1>".concat(id || 'This', " doesn't seem to be a video.</h1>\n                <p>\n                    Look, this app supposedly talks to YouTube.\n                    And for that, the mumbo jumbo after forward slash in the URL corresponds to a specific video on YouTube. Maybe you just copied the ID wrong?\n                </p>\n                <p>\n                    But cheer up, you can always <a href=\"/\">try it again</a>.\n                </p>\n            ");
      }
    },
    search: {
      resultsFor: function resultsFor() {
        return function (text, render) {
          return "Results for \u201C".concat(render(text), "\u201D");
        };
      },
      emptySearch: function emptySearch() {
        return "It seems like you didn't search for anything. Are you not in the mood to watch anything? You can try again with the search bar above.";
      },
      count: function count() {
        return function (text, render) {
          return "".concat(render(text), " views");
        };
      },
      by: function by() {
        return function (text, render) {
          return "by ".concat(render(text));
        };
      },
      views: function views() {
        return function (text, render) {
          var views = render(text);

          switch (views) {
            case "0":
              return "No views :(";

            case "1":
              return "One singular view :O";

            default:
              return "".concat(numFormatter.format(views), " views");
          }
        };
      },
      relTime: function relTime() {
        return function (text, render) {
          return render(text);
        };
      } // It's in English by default

    },
    view: {
      dlSummaryLabel: function dlSummaryLabel() {
        return "Download";
      },
      dlSummaryPara: function dlSummaryPara() {
        return "\n                Links are sorted by quality. For the 100% best experience, I recommend downloading the highest quality video, highest quality audio, and merge them using something like <code>ffmpeg</code>.\n            ";
      },
      dlListBoth: function dlListBoth() {
        return "Video + Audio";
      },
      dlListAudio: function dlListAudio() {
        return "Audio only";
      },
      dlListVideo: function dlListVideo() {
        return "Video only";
      },
      iframeA11yLabel: function iframeA11yLabel(title) {
        return "".concat(title, " - Embedded YouTube player");
      },
      metaViews: function metaViews(views) {
        switch (views) {
          case 0:
            return "No views :(";

          case 1:
            return "One singular view :O";

          default:
            return "".concat(numFormatter.format(views), " views");
        }
      },
      metaPublished: function metaPublished(date) {
        return "Published on ".concat(dateFormatter.format(date));
      },
      metaAuthor: function metaAuthor(name) {
        return "by ".concat(name);
      },
      metaAlbumAuthor: function metaAlbumAuthor(album, author) {
        return "in ".concat(author, "\u2019s album <em>").concat(album, "</em>");
      },
      metaLicense: function metaLicense(lic) {
        return "\u2117 ".concat(lic);
      },
      cardAuthor: function cardAuthor(name) {
        return "by ".concat(name);
      },
      cardViews: function cardViews(views) {
        return "".concat(views, " views");
      },
      searchLabel: function searchLabel() {
        return "Back to search";
      }
    },
    dlForm: {
      label: "Download",
      howTo: "\n                Choose an audio format, a video format, and request the server to \n                convert them into whatever format you want.\n                The table below will help you choose the best formats.\n                <br>\n                (And if you don't know which formats to choose, choose the first from both dropdowns.)\n            ",
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
      idle: "There’s nothing being downloaded at the moment. Go ahead, download a video!"
    },
    generic: {
      qualityHelper: function qualityHelper(quality, label) {
        return {
          AUDIO_QUALITY_HIGH: "High (".concat(label, "kbps)"),
          AUDIO_QUALITY_MEDIUM: "Medium (".concat(label, "kbps)"),
          AUDIO_QUALITY_LOW: "Low (".concat(label, "kbps)"),
          hd2160: "Very high (".concat(label, " 4K)"),
          hd1440: "Very high (".concat(label, " HD)"),
          hd1080: "High (".concat(label, " HD)"),
          hd720: "Medium (".concat(label, " HD)"),
          large: "Low (".concat(label, ")"),
          medium: "Low (".concat(label, ")"),
          small: "Low (".concat(label, ")"),
          tiny: "Low (".concat(label, ")")
        }[quality] || quality;
      },
      piracyNotice: "Downloading content without the written consent of both YouTube and the content\u2019s copyright owner is illegal. Downloading content off of YouTube goes against the <a href=\"https://www.youtube.com/t/terms#ad6952fd3c\">YouTube Terms of Service.</a>"
    },
    propertyLookup: {
      song: "song",
      album: "album",
      artist: "artist",
      license: "licensed_to_youtube_by",
      explicit: "parental_warning"
    },
    loadingBlobs: ["Loading...", "Stealing your YT credentials...", "ちょっと待って下さい", "stop piracy", "making SwuM type beats", "<a href=\"https://ytmp3.cc/\" target=\"_blank\">ytmp3.cc</a>", "beep boop boop loading...", "i'm not sentient, i promise!!!", "An exception has occurred. Please wait five seconds.", "Ready?", "Sleeping with your sister...", "Calling <code>setTimeout(render, 5000)</code>...", "Brewing some coffee...", "Give me a minute, I just woke up...", "Generating a blob...", "Showing up late to class yet again...", "Made with &lt;3 by <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun</a>"]
  };
});