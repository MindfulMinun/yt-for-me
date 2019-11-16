"use strict";

(function () {
  'use strict';

  if (!yt) {
    throw Error("yt isn't defined, idk what to do.");
  }

  yt.REGEX_CAPTURE_ID = /([a-zA-Z\d\-_]{11})/;
  var dict = yt.dict;
  var cont = document.querySelector('div.container');
  window.addEventListener('popstate', function (e) {
    console.log(e);
    guard(document.querySelector('.view'), function (view) {
      return cont.classList.add('anim--fuck-this-shit-im-out');
    });

    if (e.state && e.state !== (window.vid && window.vid.video_id)) {
      bootstrapView(e.state);
    } else {
      history.back();
    }
  });
  bootstrapView(guard(yt.REGEX_CAPTURE_ID.exec(location.pathname.slice(1) || ''), function (match) {
    return match[0];
  }) || '');

  function bootstrapView(id) {
    if (!yt.REGEX_CAPTURE_ID.test(id)) {
      cont.innerHTML = dict.errors.idAssertionFailed(id);
      throw Error("ID didn't match regex, something's wrong.");
    }

    history.pushState(id, id, '/' + id + location.search);
    var loading = document.createElement('p');
    loading.classList.add('loading');
    loading.innerHTML = choose(dict.loadingBlobs);
    cont.prepend(loading);
    fetch("/api/info?id=".concat(id)).then(function (res) {
      return res.json();
    }).then(function (json) {
      return json.error ? Promise.reject(json) : json;
    }).then(function (info) {
      document.title = "".concat(info.title, " \u2022 yt-for-me");
      cont.innerHTML = '';
      cont.classList.remove('anim--fuck-this-shit-im-out');
      cont.appendChild(genView(info));
      cont.appendChild(makeFooter());
      window.vid = info;
      console.log('Video info (window.vid):', info);
    })["catch"](function (err) {
      console.log(err);
      cont.innerHTML = dict.errors.error400(err.error);
    });
  }

  function genView(info) {
    var view = document.createElement('div');
    var ps = info.player_response || {};
    view.classList.add('view');
    view.classList.add('mobile-edge-flush');
    view.innerHTML = "\n            <div class=\"yt\">\n                <details class=\"yt-dl\">\n                    <summary>".concat(dict.view.dlSummaryLabel(), "</summary>\n                    <p>").concat(dict.view.dlSummaryPara(), "</p>\n                    <div class=\"yt-dl__lists\">\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListBoth(), "</strong></li>\n                        </ul>\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListAudio(), "</strong></li>\n                        </ul>\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListVideo(), "</strong></li>\n                        </ul>\n                    </div>\n                </details>\n                <div class=\"yt-embed\">\n                    <iframe\n                        title=\"").concat(dict.view.iframeA11yLabel(info.title), "\" frameborder=\"0\"\n                        src=\"https://www.youtube.com/embed/").concat(info.video_id, "?autoplay=1&hl=").concat(dict.lang, "\"\n                        allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n                        allowfullscreen\n                    ></iframe>\n                </div>\n                <div class=\"yt-related\"></div>\n                <div class=\"yt-meta\">\n                    <span class=\"yt-meta__title\">").concat(info.media && info.media.song || info.title, "</span>\n                    <span class=\"yt-meta__data\">").concat(dict.view.metaViews(ps.videoDetails.viewCount), "</span>\n                    <span class=\"yt-meta__data\">").concat(dict.view.metaPublished(info.published), "</span>\n                    <span class=\"yt-meta__data\">").concat(dict.view.metaAuthor(info.media && info.media.artist || info.author.name), "</span>\n                </div>\n                <div class=\"yt-desc\">").concat(guard(ps.microformat, function (mf) {
      return guard(mf.playerMicroformatRenderer, function (pmr) {
        return guard(pmr.description, function (desc) {
          return desc.simpleText;
        });
      });
    }) || info.description, "</div>\n            </div>\n        ");
    var category = guard(info.player_response, function (pr) {
      return guard(pr.microformat, function (mf) {
        return guard(mf.playerMicroformatRenderer, function (pmr) {
          return pmr.category;
        });
      });
    }) || info.media && info.media.category || null;

    if (category) {
      view.querySelector('.yt-meta').dataset.category = category;
    }

    info.formats.forEach(function (f, i) {
      // f for format
      var li = document.createElement('li'),
          inner = '',
          dlList;

      if (f.encoding && f.audioEncoding) {
        // Both
        dlList = view.querySelectorAll('.yt-dl ul')[0];
      } else if (!f.encoding && f.audioEncoding) {
        // Audio only
        dlList = view.querySelectorAll('.yt-dl ul')[1];
      } else if (f.encoding && !f.audioEncoding) {
        // Video only
        dlList = view.querySelectorAll('.yt-dl ul')[2];
      } else {
        // Neither?
        return;
      }

      if (f.encoding) {
        inner += "".concat(f.container, " (").concat(f.resolution, ")");
      }

      if (f.audioEncoding) {
        inner ? inner += " " : false;
        inner += "".concat(f.audioEncoding, " (").concat(f.audioBitrate, ")");
      }

      li.innerHTML = "\n                <a href=\"".concat(f.url, "\" download>").concat(inner, "</a>\n            ");
      dlList.appendChild(li);
    });
    var rel = view.querySelector('.yt-related') // Append end search card
    ;

    (function (card) {
      card.href = '/search' + location.search;
      card.classList.add('yt-card');
      card.classList.add('yt-card--back-to-search');
      card.setAttribute('aria-label', dict.view.searchLabel());
      card.innerHTML = "\n            <div class=\"yt-card--back-to-search__container\">\n                <i class=\"material-icons\">search</i>\n                <span class=\"yt-card-label\">".concat(dict.view.searchLabel(), "</span>\n            </div>\n        ");

      card.onclick = function (e) {
        return cont.classList.add('anim--fuck-this-shit-im-out');
      };

      rel.appendChild(card);
    })(document.createElement('a'));

    info.related_videos.forEach(function (vid, i) {
      if (vid.list) return;
      var card = document.createElement('a');
      card.href = '/' + vid.id + location.search;
      card.dataset.id = vid.id;

      card.onclick = function (e) {
        e.preventDefault();
        var id = this.dataset.id;
        cont.classList.add('anim--fuck-this-shit-im-out');
        bootstrapView(id);
      };

      card.classList.add('yt-card'); // card.style.backgroundImage = `url(${vid.iurlhq})`

      card.style.backgroundImage = "\n                linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)),\n                url(https://img.youtube.com/vi/".concat(vid.id, "/mqdefault.jpg)\n            ");
      card.innerHTML = "\n                <div class=\"yt-card--info\">\n                    <strong>".concat(vid.title, "</strong>\n                    <span").concat(dict.view.cardAuthor(vid.author), "</span>\n                    <span>").concat(dict.view.cardViews(vid.short_view_count_text), "</span>\n                </div>\n            ");
      rel.appendChild(card);
    });
    return view;
  }
})();