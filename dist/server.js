"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _ytdlCore = _interopRequireDefault(require("ytdl-core"));

var _ytSearch = _interopRequireDefault(require("yt-search"));

var _mustacheExpress = _interopRequireDefault(require("mustache-express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var root = (0, _path.resolve)(__dirname + '/../');
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
      vids: results.videos.map(function (v, i) {
        v.index = i; // for mustashe lol

        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        delete v.url;
        return v;
      })
    }));
  });
});
app.get('/:id', function (req, res) {
  var lang = getLang(req);
  var q = req.query.q || '';
  res.render(root + "/public/pageview.mst", {
    lang: lang,
    d: require("./langs/".concat(lang, ".js")),
    query: q
  });
});
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

app.post('/api/download', function (req, res) {
  console.log(req.body);
  var id = req.body.id || '';

  if (!_ytdlCore["default"].validateID(id)) {
    res.status(400);
    res.json({
      error: "Assertion failed, ID invalid"
    });
    return;
  }

  var audio = ytdlSave(id, 'audio');
  var video = ytdlSave(id, 'video');
  res.status(200);
  res.send('OK');
  Promise.allSettled([audio, video]).then(function (results) {
    results.forEach(function (r) {
      return console.log(r);
    });
  });
});
app.listen(process.env.PORT || 8080, function () {
  console.log('Server is live');
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
  var supported = ['en', 'es'];
  var qLang = (req.query.lang || '').slice(0, 2);
  var browser = req.acceptsLanguages(supported);

  if (supported.includes(qLang)) {
    return qLang;
  }

  if (browser) return browser;
  return 'en';
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

function ytdlSave(id, kind) {
  return new Promise(function (resolve, reject) {
    var writeStream = _fs["default"].createWriteStream("".concat(root, "/dls/").concat(id, "-").concat(kind));

    (0, _ytdlCore["default"])(id, {
      quality: ['highestvideo', 'highestaudio'][['video', 'audio'].indexOf(kind)]
    }).pipe(writeStream).on('finish', function () {
      resolve(writeStream);
    }).on('error', reject);
  });
} // All settled polyfill


if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(promises.map(function (promise, i) {
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