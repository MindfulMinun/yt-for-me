"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _ytdlCore = _interopRequireDefault(require("ytdl-core"));

var _fluentFfmpeg = _interopRequireDefault(require("fluent-ffmpeg"));

var _ytSearch = _interopRequireDefault(require("yt-search"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _serverHelpers = require("./serverHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var api = new _express["default"].Router();
var allowCorsOn = [// Requests from localhost to localhost are exempt from CORS
'https://yt.benjic.xyz', 'https://yt-for-me.herokuapp.com'];

if (!process.env.NODE_ENV) {
  allowCorsOn.push('http://localhost:8080');
} // Used to keep track of video download/conversion progress


var progresses = {};
api.use(function (req, res, next) {
  var origin = allowCorsOn.find(function (host) {
    return host === "".concat(req.protocol, "://").concat(req.get('host'));
  });
  res.set({
    'Access-Control-Allow-Origin': origin || allowCorsOn[0]
  });

  if (!origin) {
    res.send({
      error: 'Request blocked, coming from different origin',
      errCode: 0x0013
    });
    return;
  }

  next();
});
api.get('/info', function (req, res) {
  var lang = (0, _serverHelpers.getLang)(req);
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

api.get('/search', function (req, res) {
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
      vids: results.videos.filter(function (e) {
        return e.videoId !== 'L&ai';
      }).map(function (v, i) {
        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        v.ago = v.ago.replace('Streamed ', '');
        delete v.url;
        return v;
      })
    });
  });
});
api.get('/api/progress/:id', function (req, res) {
  res.json(progresses[req.params.id] || {
    error: 'Progress ID invalid',
    errCode: 0x1a
  });
});
api.post('/api/download', function (req, res) {
  var id = req.body.id || '';

  if (!_ytdlCore["default"].validateID(id)) {
    res.status(400);
    res.json({
      error: "YouTube video ID invalid",
      errCode: 0x0044
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
      error: "Invalid output format",
      errCode: 0x0045
    });
    return;
  } // Use this uuid to identify downloads.


  var dlid = (0, _v["default"])();
  var video = videoItag === 'none' ? null : ytdlSave(id, dlid, videoItag);
  var audio = audioItag === 'none' ? null : ytdlSave(id, dlid, audioItag);

  if (!(video || audio)) {
    res.status(400);
    res.json({
      error: "No input files provided",
      errCode: 0x0046
    });
    return;
  }

  progresses[dlid] = {
    started: true
  };
  res.json({
    dlid: dlid,
    poll: "/api/progress/".concat(dlid)
  });
  Promise.allSettled([video, audio]).then(function (results) {
    var err = results.find(function (p) {
      return p.status === 'rejected';
    });

    if (err) {
      progresses[dlid].error = "Format download error";
      progresses[dlid].errCode = 0x0048;
      return;
    }

    console.log('Download finished successfully, joining with ffmpeg');
    var outFileName = "".concat(dlid, ".").concat(req.body.outFormat);
    var both = path.resolve("".concat(root, "/yt-downloads/").concat(outFileName));
    var command = (0, _fluentFfmpeg["default"])();
    command.on('progress', function (progress) {
      progresses[dlid].merge = progresses[dlid].merge || {};
      progresses[dlid].merge = {
        finished: false,
        progress: progress.percent / 100
      };
    });
    command.on('end', function () {
      console.log('Merge finished!');
      progresses[dlid].url = "/yt-downloads/".concat(outFileName);
    });
    command.on('error', function (e) {
      console.log(e);
      progresses[dlid].error = e.toString() || "Conversion error", progresses[dlid].errCode = 0x0047;
    }); // Because if statements suck

    video && command.input(results[0].value.output);
    audio && command.input(results[1].value.output);
    command.format(outFormat).inputOptions('-strict experimental').save(both);
  });
});

function ytdlSave(id, dlid, itag) {
  return new Promise(function (resolve, reject) {
    var output = "".concat(root, "/yt-downloads/").concat(dlid, "-").concat(itag, ".");
    var writeStream;
    var codec;
    var stream = (0, _ytdlCore["default"])(id, {
      quality: itag
    }).on('info', function (e) {
      progresses[dlid][itag] || (progresses[dlid][itag] = {});
      progresses[dlid][itag].finished = false;
      progresses[dlid][itag].progress = 0;
      codec = (0, _serverHelpers.guard)(e.formats.filter(function (a) {
        return a.itag === itag;
      })[0], function (f) {
        return f.audioEncoding || f.encoding;
      }); // Before writing to the output stream, we gotta get the container lol
      // So we call ytdl before we know the container to get it, then pipe it to the output

      output += (0, _serverHelpers.guard)(e.formats.filter(function (a) {
        return a.itag === itag;
      })[0], function (f) {
        return f.container;
      });
      writeStream = _fs["default"].createWriteStream(path.resolve(output));
      stream.pipe(writeStream);
    }).on('finish', function () {
      progresses[dlid] || (progresses[dlid] = {});
      progresses[dlid][itag].finished = true; // Resolve with the output and the codec, not the WritableStream

      resolve({
        output: output,
        codec: codec
      });
    }).on('progress', function (a, b, c) {
      // Save the progression on the progresses object
      progresses[dlid][itag] || (progresses[dlid][itag] = {});
      progresses[dlid][itag].progress = b / c; // console.log(progresses[dlid])
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

var _default = api;
exports["default"] = _default;