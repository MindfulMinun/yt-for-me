"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = require("path");

var _ytdlCore = require("ytdl-core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var root = (0, _path.resolve)(__dirname + "/../"); // http://expressjs.com/en/starter/static-files.html

app.use(_express["default"]["static"]('public')); // http://expressjs.com/en/starter/basic-routing.html

app.get('/', function (req, res) {
  res.sendFile(root + '/public/index.html');
});
app.get(/\.(js|css)$/, function (req, res) {
  res.sendFile(root + '/public' + req.path);
});
app.get('/:id', function (req, res) {
  res.sendFile(root + '/public/index.html');
});
app.get('/info/:id', function (req, res) {
  var id = req.params.id;
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
app.listen(process.env.PORT || 8080, function () {
  console.log('Server is live');
});