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

  var numFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal'
  });
  var dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: "medium",
    timeStyle: "medium"
  });
  var errors = (_errors = {}, _defineProperty(_errors, 0x0010, "Request error (HTTP 400)"), _defineProperty(_errors, 0x0011, "Empty request"), _defineProperty(_errors, 0x0012, "Not found"), _defineProperty(_errors, 0x0013, "Refused to serve cross-origin request"), _defineProperty(_errors, 0x0014, "Too many requests (HTTP 429)"), _defineProperty(_errors, 0x0015, "You're a bot"), _defineProperty(_errors, 0x0030, "Client-side error"), _defineProperty(_errors, 0x0031, "Assertion failed"), _defineProperty(_errors, 0x0032, "YouTube ID didn't match RegExp"), _defineProperty(_errors, 0x0040, "API error"), _defineProperty(_errors, 0x0041, "Failed to retrieve video information via ytdl-core"), _defineProperty(_errors, 0x0042, "Search via yt-search failed"), _defineProperty(_errors, 0x0043, "Download progress ID invalid"), _defineProperty(_errors, 0x0044, "YouTube video ID invalid"), _defineProperty(_errors, 0x0045, "Invalid output format"), _defineProperty(_errors, 0x0046, "No input files provided"), _defineProperty(_errors, 0x0047, "Conversion error"), _defineProperty(_errors, 0x0048, "Format download error"), _defineProperty(_errors, 0x0050, "Server error"), _defineProperty(_errors, 0x0051, "Unexpected server error"), _defineProperty(_errors, 0x0052, "Temporary outage (HTTP 503)"), _defineProperty(_errors, 0xba11ad, "Service discontinued"), _defineProperty(_errors, 0x0961, "L is real"), _defineProperty(_errors, 0x0539, "Debugging"), _errors);
  return {
    lang: 'en-US',
    welcome: {
      hi: "Hi there. This app lets you download videos from YouTube in any format you want. Give it a try.",
      love: "\n                Made with &lt;3 by <a href=\"https://benjic.xyz\" target=\"_blank\">MindfulMinun.</a>\n            ",
      don8: "If you like this website, <a href=\"https://ko-fi.com/mindfulminun\" target=\"_blank\">buy&nbsp;me&nbsp;a&nbsp;coffee.</a>",
      source: "\n                <a href=\"https://github.com/MindfulMinun/yt-for-me\" target=\"_blank\">Source</a>\n            ",
      nojs: "\n                <p>Unfortunately, this really cool website needs you to enable <em>JavaScript</em>.\n                The internet won't stop asking you to enable it if you don't.\n                But most importantly, you won't be able to watch YouTube videos. :(</p>\n                \n                <p>Do yourself a favor and <a href=\"https://www.enable-javascript.com/\">enable it</a>.</p>\n            ",
      home: "Home",
      vid: "Might I suggest <a href=\"/VgUR1pna5cY\" data-random>a video</a>?",
      searchPre: "Or search for your own:",
      searchPlaceholder: "Search",
      languageA11yLabel: "Language"
    },
    errors: {
      myFault: function myFault() {
        return "\n                <p>\n                    If you think <em>i</em> fucked up, then\n                    <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">let me know</a>\n                </p>\n                <p>\n                    Otherwise, <a href=\"/\">start over</a>\n                </p>\n            ";
      },
      error400: function error400(err) {
        return "\n                <div class=\"error\">\n                    <h2>Ah snap,, an error occurred!!1!!</h2>\n                    <p>Error: ".concat(errors[err.errCode] || err.error, " (code 0x").concat((err.errCode || 0).toString(16), ")</p>\n                    ").concat(err.error ? "\n                        <p>The server said: <samp>".concat(err.error, "</samp></p>\n                    ") : '', "\n                    <p>Reload the page.</p>\n                </div>\n            ");
      },
      searchErr: function searchErr(err) {
        return "\n                <div class=\"error\">\n                    <h2>Ah snap,, my search lens broke!</h2>\n                    <p>An error occurred: ".concat(errors[err.errCode] || err.error, " (code 0x").concat((err.errCode || 0).toString(16), ")</p>\n                    ").concat(err.error ? "\n                        <p>The server said: <samp>".concat(err.error, "</samp></p>\n                    ") : '', "\n                    <p>Reload the page.</p>\n                </div>\n            ");
      },
      idAssertionFailed: function idAssertionFailed(id) {
        return "\n                <h1>".concat(id || 'This', " doesn't seem to be a video.</h1>\n                <p>\n                    Look, this app supposedly talks to YouTube.\n                    And for that, the mumbo jumbo after forward slash in the URL corresponds to a specific video on YouTube. Maybe you just copied the ID wrong?\n                </p>\n                <p>\n                    But cheer up, you can always <a href=\"/\">try it again</a>.\n                </p>\n            ");
      }
    },
    search: {
      resultsFor: function resultsFor(query) {
        return "Results for \u201C".concat(query, "\u201D");
      },
      loading: function loading(search) {
        return "Searching for \u201C".concat(search, "\u201D...");
      },
      emptySearch: function emptySearch() {
        return "It seems like you didn't search for anything. Are you not in the mood to watch anything? You can try again with the search bar above.";
      },
      by: function by(author) {
        return "by ".concat(author);
      },
      views: function views(_views) {
        switch (_views) {
          case 0:
            return "No views :(";

          case 1:
            return "One singular view :O";

          default:
            return "".concat(numFormatter.format(_views), " views");
        }
      },
      relTime: function relTime(ago) {
        return ago;
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
            return "One single view :O";

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
      howTo: "\n                Choose an audio format, a video format, and request the server to \n                convert them into whatever format you want.\n                The table below will help you choose the best formats.\n            ",
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
      dlLabel: "Download",
      states: {
        starting: "Starting...",
        downloading: "Downloading...",
        converting: "Converting...",
        done: "Conversion successful!"
      },
      percentage: function percentage(p) {
        return "".concat(Math.round(p * 100), "%");
      },
      idle: "There’s nothing being downloaded at the moment. Go ahead, download a video!"
    },
    generic: {
      piracyNotice: "Downloading content without the written consent of both YouTube and the content\u2019s copyright owner is illegal. Downloading content off of YouTube goes against the <a href=\"https://www.youtube.com/t/terms#ad6952fd3c\">YouTube Terms of Service.</a>",
      reportErrLabel: 'Report an error'
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