"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ytdlCore = _interopRequireDefault(require("ytdl-core"));

var _ytSearch = _interopRequireDefault(require("yt-search"));

var _fluentFfmpeg = _interopRequireDefault(require("fluent-ffmpeg"));

var _mustacheExpress = _interopRequireDefault(require("mustache-express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();

var root = _path["default"].resolve(__dirname + '/../');

app.use(require('cookie-parser')());
app.use(_express["default"].json());
app.engine('mst', (0, _mustacheExpress["default"])(__dirname + '/public', '.mst'));
app.set('view engine', 'mustache');
app.get('/', function (req, res) {
  var lang = getLang(req);
  res.render("".concat(root, "/public/index.mst"), {
    lang: lang,
    d: require("./langs/".concat(lang, ".js"))
  });
});
app.get(/\.js$/, function (req, res) {
  res.sendFile(root + '/dist' + req.path);
});
app.get(/\.css$/, function (req, res) {
  res.sendFile(root + '/public' + req.path);
});
app.get('/search', function (req, res) {
  var q = req.query.q || '';
  var page = req.query.page || 1;
  var lang = getLang(req);
  var render = {
    lang: lang,
    d: require("./langs/".concat(lang, ".js")),
    query: q,
    page: page
  };

  if (q.trim().length === 0) {
    res.render(root + '/public/search.mst', Object.assign(render, {
      vids: []
    }));
    return;
  }

  (0, _ytSearch["default"])({
    query: q,
    pageStart: page,
    pageEnd: page + 1
  }, function (err, results) {
    if (err) {
      res.status(400);
      res.render(root + '/public/search.mst', Object.assign(render, {
        error: err.toString().replace(/^Error(?::\s*)/, ''),
        vids: []
      }));
      return;
    }

    res.render(root + '/public/search.mst', Object.assign(render, {
      vids: results.videos.filter(function (e) {
        return e.id !== 'L&ai';
      }).map(function (v, i) {
        v.index = i; // for mustashe lol

        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        delete v.url;
        return v;
      })
    }));
  });
});
app.get('/yt-downloads/:vid', function (req, res) {
  res.sendFile(_path["default"].resolve("".concat(root, "/yt-downloads/").concat(req.params.vid)));
});
app.get('/:id', function (req, res) {
  var lang = getLang(req);
  var q = req.query.q || '';
  res.render(root + "/public/pageview.mst", {
    lang: lang,
    d: require("./langs/".concat(lang, ".js")),
    query: q
  });
}); // Keep track of video progresses lol

var progresses = {};
/**
 * GET /info
 * Request query parameters:
 *     id: The YouTube ID of the video in question
 * 
 * 200 OK:
 *     JSON of video metadata provided by ytdl-core
 * 500 Internal Server Error
 *     The error property describes the error
 */

app.get('/api/info', function (req, res) {
  var lang = getLang(req);
  var id = req.query.id;

  _ytdlCore["default"].getInfo(id, {
    lang: lang
  }).then(function (info) {
    res.json(info);
  })["catch"](function (err) {
    res.status(500);
    res.json({
      error: err.toString().replace(/^Error(?::\s*)/, '')
    });
  });
});
/**
 * GET /search
 * Request query parameters:
 *     q: The search query
 *     page: The search page results number. Starts at 1, can be omitted.
 * 
 * 200 OK:
 *     JSON, the vids property returns results provided by ytSearch.
 * 500 Internal Server Error
 *     The error property describes the error
 */

app.get('/api/search', function (req, res) {
  var q = req.query.q || '';
  var page = req.query.page || 0;
  (0, _ytSearch["default"])({
    query: q,
    pageStart: page,
    pageEnd: page + 1
  }, function (err, results) {
    if (err) {
      res.status(500);
      res.json({
        error: err.toString().replace(/^Error(?::\s*)/, '')
      });
      return;
    }

    res.json({
      query: q,
      page: page,
      vids: results.videos.map(function (v, i) {
        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        delete v.url;
        return v;
      })
    });
  });
});
/**
 * POST /download
 * Makes the server download a video (pog)
 * POST:
 *     id: The ytid of the video (obviously)
 *     videoItag: The itag of the video file
 *     audioItag: The itag of the audio file
 *     outFormat: The format of the output file
 * 
 * 200 OK:
 *     JSON, the vids property returns results provided by ytSearch.
 * 500 Internal Server Error
 *     The error property describes the error
 */

app.post('/api/download', function (req, res) {
  var acceptedFormats = ['mp3', 'acc', 'ogg', 'mp4', 'mpeg', 'webm'];
  console.log(req.body);
  var id = req.body.id || '';

  if (!_ytdlCore["default"].validateID(id)) {
    res.status(400);
    res.json({
      error: "Assertion failed, ID invalid"
    });
    return;
  }

  var _req$body = req.body,
      videoItag = _req$body.videoItag,
      audioItag = _req$body.audioItag,
      outFormat = _req$body.outFormat;

  if (acceptedFormats.indexOf(req.body.outFormat) === -1) {
    res.status(400);
    res.json({
      error: "outFormat is not an accepted format"
    });
    return;
  }

  var video = videoItag === 'none' ? null : ytdlSave(id, videoItag);
  var audio = audioItag === 'none' ? null : ytdlSave(id, audioItag);

  if (!(video || audio)) {
    res.status(400);
    res.json({
      error: "No input files to work with"
    });
  }

  Promise.allSettled([video, audio]).then(function (results) {
    console.log('Download finished, joining with ffmpeg');
    var outFileName = "".concat(id, ".").concat(req.body.outFormat);

    var both = _path["default"].resolve("".concat(root, "/yt-downloads/").concat(outFileName));

    var command = (0, _fluentFfmpeg["default"])();
    command.on('end', function () {
      console.log('Merge finished!');
      res.json({
        url: "/yt-downloads/".concat(outFileName)
      });
    });
    command.on('error', function (e) {
      console.log(e);
      res.status(400);
      res.json({
        error: e.toString() || "An unexpected error occurred"
      });
    });

    if (video) {
      command.input(results[0].value.output); //    .videoCodec(results[0].value.codec)
    }

    if (audio) {
      command.input(results[1].value.output); //    .audioCodec(results[1].value.codec)
    }

    command.format(outFormat).inputOptions('-strict experimental').save(both); // ffmpeg -i id-video.webm -i id-audio.webm -c:v copy -c:a aac -strict experimental id-both.mp4
    // ffmpeg()
    //     .input(results[0].value)
    //     .videoCodec('copy')
    //     .input(results[1].value)
    //     .audioCodec('aac')
    //     .format('mp4')
    //     .inputOptions('-strict experimental')
    //     .save(both)
    //     .on('end', function () {
    //         console.log('Merge finished!')
    //         res.json({
    //             url: `/yt-downloads/${outFileName}`
    //         })
    //     })
    //     .on('error', function (e) {
    //         res.status(400)
    //         res.json({
    //             error: e.toString() || "An unexpected error occurred"
    //         })
    //     })
  });
});
app.listen(process.env.PORT || 8080, function () {
  console.log("Server is live");
});
/**
 * Returns a supported language
 * @param {Request} req - The request lol
 * @returns {string} A supported language
 * @author MindfulMinun
 * @since Oct 19, 2019
 * @version 1.0.0
 */

function getLang(req) {
  var supported = ['en-US', 'es-US'];
  var qLang = req.query.lang || '';
  var browser = req.acceptsLanguages(supported);

  if (supported.includes(qLang)) {
    return qLang;
  }

  if (browser) return browser;
  return 'en-US';
}
/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */


function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
/**
 * Decaffeinate-style guard
 * @param {*} what - The thing that might be null or undefined
 * @param {function} mod - The modifier
 * @returns {*} The return value of your function or undefined if nullish
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */


function guard(what, mod) {
  return typeof what !== 'undefined' && what !== null ? mod(what) : void 0;
}

function ytdlSave(id, itag) {
  return new Promise(function (resolve, reject) {
    var output = "".concat(root, "/yt-downloads/").concat(id, "-").concat(itag, ".");
    var writeStream;
    var codec;
    var stream = (0, _ytdlCore["default"])(id, {
      quality: itag
    }).on('info', function (e) {
      progresses[id] || (progresses[id] = {});
      progresses[id][itag] || (progresses[id][itag] = {});
      progresses[id][itag].isFinished = false;
      progresses[id][itag].progress = 0;
      codec = guard(e.formats.filter(function (a) {
        return a.itag === itag;
      })[0], function (f) {
        return f.audioEncoding || f.encoding;
      }); // Before writing to the output stream, we gotta get the container lol
      // So we call ytdl before we know the container, then pipe it to the output

      output += guard(e.formats.filter(function (a) {
        return a.itag === itag;
      })[0], function (f) {
        return f.container;
      });
      writeStream = _fs["default"].createWriteStream(_path["default"].resolve(output));
      stream.pipe(writeStream);
    }).on('finish', function () {
      progresses[id] || (progresses[id] = {});
      progresses[id][itag].isFinished = true; // Resolve with the output, not the WritableStream

      resolve({
        output: output,
        codec: codec
      });
    }).on('progress', function (a, b, c) {
      // Save the progression on the progresses object
      progresses[id][itag] || (progresses[id][itag] = {});
      progresses[id][itag].progress = b / c;
      console.log(progresses[id]);
    }).on('error', reject);
  });
} // All settled polyfill


if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(promises.map(function (promise) {
      promise = promise || Promise.reject();
      return promise.then(function (value) {
        return {
          status: "fulfilled",
          value: value
        };
      })["catch"](function (reason) {
        return {
          status: "rejected",
          reason: reason
        };
      });
    }));
  };
}