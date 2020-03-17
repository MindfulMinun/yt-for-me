"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRawPlaylistInfo = getRawPlaylistInfo;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// let it = document.documentElement.innerText
//     jjson = it.split('window["ytInitialData"] = ').pop().split(';\n')[0];
// JSON.parse(jjson)
// const url = 'https://www.youtube.com/playlist?list=&hl=es-US&bpctr=' + Math.ceil(Date.now() / 1000)
// http://www.youtube.com/get_video_info?video_id=znphh0fB-gA
var BASE = 'https://www.youtube.com/playlist?';

function getRawPlaylistInfo(playlistId) {
  var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  var opts = ['list=' + playlistId, 'hl=' + lang, 'bpctr=' + Math.ceil(Date.now() / 1000)].join('&'); // 'PLIm1cC9KsS_0AvI3B30PikS7A2k_puXTr'

  return (0, _nodeFetch["default"])(BASE + opts, {
    'headers': {
      'Accept-Language': lang,
      'User-Agent': '' // Leave blank

    }
  }).then(function (res) {
    return res.text();
  }).then(function (txt) {
    console.log(txt);
  });
}