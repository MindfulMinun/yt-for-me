"use strict";

var dict = {
  LOCALE: 'en',
  errors: {
    error400: function error400(err) {
      return "\n            <h1>Oh dang, a level 400 error!!1!!!</h1>\n            <p>The server says: <samp>".concat(err, "</samp></p>\n            <p>\n                It looks like you did something wrong,\n                that video probably doesn\u2019t exist.\n            </p>\n            <p>\n                If you think <em>i</em> fucked up, then\n                <a href=\"https://benjic.xyz/#contact\" target=\"_blank\">let me know</a>\n            </p>\n            <p>\n                Otherwise, <a href=\"/\">start over</a>\n            </p>\n        ");
    }
  },
  view: {
    dlSummaryLabel: function dlSummaryLabel() {
      return "Download";
    },
    dlSummaryPara: function dlSummaryPara() {
      return "\n            Links are sorted by quality. For the 100% best experience, I recommend downloading the highest quality video, highest quality audio, and merge them using something like <code>ffmpeg</code>.\n        ";
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
      return "".concat(views, " views");
    },
    metaPublished: function metaPublished(date) {
      return "Published on ".concat(date);
    },
    metaAuthor: function metaAuthor(name) {
      return "by ".concat(name);
    },
    cardAuthor: function cardAuthor(name) {
      return "by ".concat(name);
    },
    cardViews: function cardViews(views) {
      return "".concat(views, " views");
    }
  }
};