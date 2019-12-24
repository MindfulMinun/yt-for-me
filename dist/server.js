"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _ytSearch = _interopRequireDefault(require("yt-search"));

var _mustacheExpress = _interopRequireDefault(require("mustache-express"));

var _serverHelpers = require("./serverHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();

var root = _path["default"].resolve(__dirname + '/../'); // Constants


var acceptedFormats = ['mp3', 'acc', 'ogg', 'mp4', 'mov', 'mpeg', 'webm']; // Load POST requests as JSON

app.use(_express["default"].json()); // Use Mustache

app.engine('mst', (0, _mustacheExpress["default"])(__dirname + '/public', '.mst'));
app.set('view engine', 'mustache');
app.get('/', function (req, res) {
  var lang = (0, _serverHelpers.getLang)(req);
  res.render("".concat(root, "/public/index.mst"), {
    lang: lang,
    d: require("./langs/".concat(lang, ".js"))
  });
});
app.get('/node_modules/:path([\\s\\S]*)', function (req, res) {
  var p = _path["default"].resolve(root + '/node_modules/' + req.params.path);

  res.sendFile(p);
});
app.get('/js/:path([\\s\\S]*)', function (req, res) {
  var p = _path["default"].resolve(root + '/dist/' + req.params.path);

  res.sendFile(p);
});
app.get('/css/:path([\\s\\S]*)', function (req, res) {
  var p = _path["default"].resolve(root + '/public/' + req.params.path);

  res.sendFile(p);
});
app.get('/search', function (req, res) {
  var q = req.query.q || '';
  var page = Math.max(1, req.query.page || 1);
  var lang = (0, _serverHelpers.getLang)(req);
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
        errCode: 0x0042,
        vids: []
      }));
      return;
    }

    res.render(root + '/public/search.mst', Object.assign(render, {
      vids: results.videos.filter(function (e) {
        return e.videoId !== 'L&ai';
      }).map(function (v, i) {
        v.index = i; // for mustashe lol

        v.thumb = "https://img.youtube.com/vi/".concat(v.videoId, "/mqdefault.jpg");
        v.ago = v.ago.replace('Streamed ', '');
        delete v.url;
        return v;
      })
    }));
  });
});
app.get('/yt-downloads/:vid', function (req, res) {
  res.sendFile(_path["default"].resolve("".concat(root, "/yt-downloads/").concat(req.params.vid)));
});
app.get('/:id([a-zA-Z0-9_-]{11})', function (req, res) {
  var lang = (0, _serverHelpers.getLang)(req);
  var q = req.query.q || '';
  res.render(root + "/public/video.mst", {
    lang: lang,
    d: require("./langs/".concat(lang, ".js")),
    query: q
  });
});
app.use('/api', require('./api')["default"]); // Handle 404s

app.use(function (req, res, next) {
  res.status(404); // if (req.accepts('html')) {
  //     res.render('404', { url: req.url })
  //     return
  // }

  if (req.accepts('json')) {
    res.send({
      error: 'Not found',
      errCode: 0x0012
    });
    return;
  } // Plain text default


  res.type('txt').send('Not found');
}); // Handle 500s

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    error: 'Server error',
    errCode: 0x0051
  });
});
app.listen(process.env.PORT || 8080, function () {
  console.log("Server is live");
});