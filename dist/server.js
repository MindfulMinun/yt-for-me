"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = require("path");

var _ytdlCore = require("ytdl-core");

var _ytSearch = _interopRequireDefault(require("yt-search"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var root = (0, _path.resolve)(__dirname + '/../'); // http://expressjs.com/en/starter/static-files.html

app.use(_express["default"]["static"]('public')); // http://expressjs.com/en/starter/basic-routing.html

app.get('/', function (req, res) {
  var lang = getLang(req);
  res.sendFile(root + "/public/".concat(lang, "/index.html"));
});
app.get(/\.(js|css)$/, function (req, res) {
  res.sendFile(root + '/public' + req.path);
});
app.get('/api/info', function (req, res) {
  var id = req.query.id;
  (0, _ytdlCore.getInfo)(id).then(function (info) {
    res.json(info);
  })["catch"](function (err) {
    console.log(err + '');
    res.status(400);
    res.json({
      error: err.toString().replace(/^Error(?::\s*)/, '')
    });
  });
});
app.get('/api/search', function (req, res) {
  var q = req.query.q || '';
  var page = req.query.page || 1;
  (0, _ytSearch["default"])({
    query: q,
    pageStart: page,
    pageEnd: page + 1
  }, function (err, results) {
    if (err) {
      res.status(400);
      res.json({
        error: err.toString().replace(/^Error(?::\s*)/, '')
      });
      return;
    }

    res.json({
      query: q,
      page: page,
      vids: results.videos.map(function (v) {
        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        delete v.url;
        return v;
      })
    });
  });
});
app.get('/:id', function (req, res) {
  var lang = getLang(req);
  res.sendFile(root + "/public/".concat(lang, "/pageview.html"));
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