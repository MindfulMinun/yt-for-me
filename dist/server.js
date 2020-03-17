"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _compression = _interopRequireDefault(require("compression"));

var _ytSearch = _interopRequireDefault(require("yt-search"));

var _mustacheExpress = _interopRequireDefault(require("mustache-express"));

var _serverHelpers = require("./serverHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = (0, _express["default"])();

var rootPath = _path["default"].resolve(__dirname + '/../'); // Load POST requests as JSON


app.use(_express["default"].json()); // gzip *everything*

app.use((0, _compression["default"])()); // Use Mustache

app.engine('mst', (0, _mustacheExpress["default"])(rootPath + '/public', '.mst'));
app.set('view engine', 'mustache');
app.get('/', function (req, res) {
  var lang = (0, _serverHelpers.getLang)(req);
  res.render("".concat(rootPath, "/public/index.mst"), {
    lang: lang,
    d: require("./langs/".concat(lang, ".js"))
  });
});
app.use(_express["default"]["static"](rootPath + '/public'));
app.use('/node_modules', _express["default"]["static"](rootPath + '/node_modules'));
app.use('/js', _express["default"]["static"](rootPath + '/dist'));
app.use('/css', _express["default"]["static"](rootPath + '/public'));
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
  res.render(rootPath + '/public/search.mst', render);
});
app.get('/:id([a-zA-Z0-9_-]{11})', function (req, res) {
  res.redirect(_url["default"].format({
    pathname: "/video",
    query: _objectSpread({}, req.query, {
      v: req.params.id
    })
  }));
});
app.get('/video', function (req, res) {
  var lang = (0, _serverHelpers.getLang)(req);
  res.render(rootPath + "/public/video.mst", {
    lang: lang,
    d: require("./langs/".concat(lang, ".js")),
    query: req.query.q || ''
  });
});
app.use('/api', require('./api')["default"]); // Handle 500s

app.use(function (err, req, res, next) {
  if (/no such file or directory/i.test(err)) {
    res.status(404); // if (req.accepts('html')) {
    //     res.render('404', { url: req.url })
    //     return
    // }

    if (req.accepts('json')) {
      res.send({
        error: 'Not found',
        errCode: 0x0102
      });
      return;
    } // Plain text default


    res.type('txt').send('Not found');
    return;
  }

  res.status(500).send({
    // error: 'Server error',
    error: err.toString(),
    errCode: 0x0501
  });
});
app.listen(process.env.PORT || 8080, function () {
  console.log("Server is live");
});