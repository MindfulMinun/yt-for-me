"use strict";

(function () {
  'use strict'; // Assert the global yt is defined

  if (!yt) {
    throw Error("yt isn't defined, idk what to do.");
  } // Some locals for later


  var dict = yt.dict;
  var cont = document.querySelector('div.container'); // Listen for back/forward events
  // Bootstrap view handles view loading

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
  }); // On page load, load the video the URL is currently at

  bootstrapView(guard(yt.REGEX_CAPTURE_ID.exec(location.pathname.slice(1) || ''), function (match) {
    return match[0];
  }) || '');

  function bootstrapView(id) {
    if (!yt.REGEX_CAPTURE_ID.test(id)) {
      cont.innerHTML = dict.errors.idAssertionFailed(id);
      throw Error("ID didn't match regex, something's wrong.");
    }

    history.pushState(id, id, '/' + id + location.search); // Display a loading blob (blob = message before UI loads)

    var loading = document.createElement('p');
    loading.classList.add('loading');
    loading.innerHTML = choose(dict.loadingBlobs);
    cont.prepend(loading); // Get video data

    fetch("/api/info?id=".concat(id, "&lang=").concat(yt.dict.lang)).then(function (res) {
      return res.json();
    }).then(function (json) {
      return json.error ? Promise.reject(json) : json;
    }).then(function (info) {
      // Set the document title to the video title
      document.title = "".concat(info.title, " \u2022 yt-for-me"); // Prepare the content div for population

      cont.innerHTML = '';
      cont.classList.remove('anim--fuck-this-shit-im-out'); // Populate the div

      cont.appendChild(genView(info));
      cont.appendChild(makeFooter()); // Expose the vid data cuz why not

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
    view.classList.add('mobile-edge-flush'); // Cherry pick the properties we want from info and mod them here.

    var vid = cherryPickProperties(info);
    document.title = "".concat(vid.title, " \u2022 yt-for-me");
    view.innerHTML = "\n            <div class=\"yt\">\n                <details class=\"yt-dl\">\n                    <summary>".concat(dict.view.dlSummaryLabel(), "</summary>\n                    <p>").concat(dict.view.dlSummaryPara(), "</p>\n                    <!--\n                    <div class=\"yt-btn-group\">\n                        <button class=\"yt-btn\">").concat(dict.view.dlListBoth(), "</button>\n                        <button class=\"yt-btn\">").concat(dict.view.dlListAudio(), "</button>\n                        <button class=\"yt-btn\">").concat(dict.view.dlListVideo(), "</button>\n                    </div>\n                    -->\n                    <label>\n                        Audio: \n                        <select class=\"yt-select yt-select--compact\">\n                        <option>Sin audio</option>\n                        <option>mp3</option>\n                        <option>acc</option>\n                        <option>ogg</option>\n                        <option>webm</option>\n                        </select>\n                    </label>\n                    <label>\n                        Video: \n                        <select class=\"yt-select yt-select--compact\">\n                            <option>Sin video</option>\n                            <option>mp4</option>\n                            <option>acc</option>\n                            <option>mpeg</option>\n                            <option>webm</option>\n                        </select>\n                    </label>\n                    <label>\n                        Salida: \n                        <select class=\"yt-select yt-select--compact\">\n                            <optgroup label=\"Audio\">\n                                <option>mp3</option>\n                                <option>acc</option>\n                                <option>ogg</option>\n                                <option>webm</option>\n                            </optgroup>\n                            <optgroup label=\"Video (y tambi\xE9n audio)\">\n                                <option>mp4</option>\n                                <option>acc</option>\n                                <option>mpeg</option>\n                                <option>webm</option>\n                            </optgroup>\n                        </select>\n                    </label>\n                    <!--\n                    <div class=\"yt-dl__lists\">\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListBoth(), "</strong></li>\n                        </ul>\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListAudio(), "</strong></li>\n                        </ul>\n                        <ul>\n                            <li><strong>").concat(dict.view.dlListVideo(), "</strong></li>\n                        </ul>\n                    </div>\n                    -->\n                    </details>\n                <div class=\"yt-embed\">\n                    <iframe\n                        title=\"").concat(dict.view.iframeA11yLabel(info.title), "\" frameborder=\"0\"\n                        src=\"https://www.youtube.com/embed/").concat(info.video_id, "?autoplay=1&hl=").concat(dict.lang, "\"\n                        allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n                        allowfullscreen\n                    ></iframe>\n                </div>\n                <div class=\"yt-related\"></div>\n                <div class=\"yt-meta\">\n                    <span class=\"yt-meta__title\">").concat(vid.title, "</span>\n                </div>\n                <div class=\"yt-desc\">").concat(guard(ps.microformat, function (mf) {
      return guard(mf.playerMicroformatRenderer, function (pmr) {
        return guard(pmr.description, function (desc) {
          return desc.simpleText;
        });
      });
    }) || info.description, "</div>\n            </div>\n        ");

    (function () {
      var meta = view.querySelector('.yt-meta');
      vid.views && meta.appendChild(createMetaTag(dict.view.metaViews(vid.views)));
      info.published && meta.appendChild(createMetaTag(dict.view.metaPublished(info.published)));
      vid.author && meta.appendChild(createMetaTag(vid.album ? dict.view.metaAlbumAuthor(vid.album, vid.author) : dict.view.metaAuthor(vid.author)));
      vid.license && meta.appendChild(createMetaTag(dict.view.metaLicense(vid.license)));
    })();

    var category = guard(info.player_response, function (pr) {
      return guard(pr.microformat, function (mf) {
        return guard(mf.playerMicroformatRenderer, function (pmr) {
          return pmr.category;
        });
      });
    }) || false;

    if (category) {
      view.querySelector('.yt-meta').dataset.category = category;
    }

    info.formats.forEach(function (f, i) {
      return; // Just don't do anything for now.
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
      // card.style.backgroundImage = `
      //     linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)),
      //     url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)
      // `

      card.style.setProperty('--card-bg-image', "url(https://img.youtube.com/vi/".concat(vid.id, "/mqdefault.jpg)"));
      card.innerHTML = "\n                <div class=\"yt-card--info\">\n                    <strong>".concat(vid.title, "</strong>\n                    <span>").concat(dict.view.cardAuthor(vid.author), "</span>\n                    <span>").concat(dict.view.cardViews(vid.short_view_count_text), "</span>\n                </div>\n            ");
      rel.appendChild(card);
    });
    return view;
  }

  function cherryPickProperties(info) {
    var vid = {};
    var ps = info.player_response || {}; // Check media title (song title),
    // then check the microformat title (translated???)
    // then default the basic property

    vid.title = info.media && info.media[dict.propertyLookup.song] || guard(ps.microformat, function (mf) {
      return guard(mf.playerMicroformatRenderer, function (r) {
        return guard(r.title, function (t) {
          return t.simpleText;
        });
      });
    }) || info.title;
    vid.author = info.media && info.media[dict.propertyLookup.artist] || info.author.name;
    vid.album = info.media && info.media[dict.propertyLookup.album];
    vid.license = info.media && info.media[dict.propertyLookup.license];
    vid.isExplicit = !!(info.media && info.media[dict.propertyLookup.explicit]);
    vid.views = +ps.videoDetails.viewCount;
    return vid;
  }

  function createMetaTag(innerHTML) {
    var span = document.createElement('span');
    span.classList.add('yt-meta__data');
    span.innerHTML = innerHTML;
    return span;
  }
})();