"use strict";

(function () {
  'use strict'; // Assert the global yt is defined

  if (!yt) {
    throw Error("yt isn't defined, idk what to do.");
  }

  yt.views = yt.views || {};
  yt.views.playlistInit = init;

  yt.views.playlistReplace = function (playlistId, wasReplaced) {
    document.getElementById('view').classList.add('anim--fuck-this-shit-im-out');
    yt.views.playlistInit(playlistId, wasReplaced);
  };

  function init(playlistId, wasReplaced) {
    var searchParams = yt.cleanUpSearchParams();
    var view = document.getElementById('view');
    searchParams.set('list', playlistId);

    if (!wasReplaced) {
      history.pushState({
        qi: yt.qi(),
        view: 'playlist',
        params: searchParams.toString(),
        pid: playlistId
      }, playlistId, "/playlist?".concat(searchParams));
    }

    setLoading(view);
    fetch("/api/infoPlaylist?list=".concat(playlistId, "&lang=").concat(yt.lang)).then(function (r) {
      return r.json();
    }).then(yt.rejectOnFetchErr).then(function (playlist) {
      // Set the document title to the video title
      // (may be overwritten later)
      document.title = "".concat(playlist.info.title, " \u2022 yt-for-me");
      window.info = playlist; // Prepare the content div for population

      view.innerHTML = '';
      view.classList.remove('anim--fuck-this-shit-im-out', 'search--empty-state'); // Populate the div

      view.append(generateView(playlist));
    })["catch"](function (err) {
      // If an error occurred, tell the user about it.
      console.log(err);
      view.innerHTML = dict('errors/error400', err);
    });
  }

  function setLoading(cont) {
    var loading = document.createElement('p');
    loading.classList.add('loading');
    loading.innerHTML = choose(yt.dict.loadingBlobs);
    cont.prepend(loading);
  }

  function generateView(playlist) {
    var playlistContainer = document.createElement('div');
    playlistContainer.classList.add('yt');
    playlistContainer.append( // generateFrame(playlist),
    // generateHeader(playlist),
    generateTile(playlist), generateDesc(playlist), generateList(playlist));
    return playlistContainer;
  }

  function generateFrame(playlist) {
    var div = document.createElement('div');
    div.classList.add('yt-embed');
    div.innerHTML = "\n            <iframe src=\"https://www.youtube.com/embed/videoseries?list=".concat(playlist.info.pid, "\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>\n        ");
    return div;
  }

  function generateHeader(playlist) {
    var div = document.createElement('div');
    div.classList.add('yt-meta');
    div.innerHTML = "\n            <span class=\"yt-meta__title\">".concat(playlist.info.title, "</span>\n            <span>").concat(dict('playlist/count', playlist.info.actualCount), " \u2022 ").concat(dict('view/metaViews', playlist.info.views), "</span>\n            <p class=\"yt-meta__desc\">").concat(info.info.description || "<em class=\"yt-meta__data\">".concat(dict('view/noDesc'), "</em>"), "</p>\n        ");

    if (playlist.info.isUnlisted) {
      div.querySelector('.yt-meta__title').innerHTML += "&nbsp;<span class=\"badge\">".concat(dict('playlist/unlisted'), "</span>");
    }

    return div;
  }

  function generateDesc(playlist) {
    var div = document.createElement('div');
    div.classList.add('yt-desc');
    div.innerHTML = playlist.info.description || "<em class=\"yt-meta__data\">".concat(dict('view/noDesc'), "</em>");
    return div;
  }

  function generateTile(playlist) {
    var div = document.createElement('div');
    div.classList.add('tile');
    div.innerHTML = "\n            <img alt=\"\" src=\"".concat(safeLookup(playlist, ['elements', 0, 'thumbnail', 'thumbnails', 0, 'url']) || playlist.info.thumbnails[playlist.info.thumbnails.length - 1].url, "\">\n            <div class=\"tile-text\">\n                <span class=\"yt-meta__title\">").concat(playlist.info.title, "</span>\n                <span>").concat(dict('playlist/count', playlist.info.actualCount), " \u2022 ").concat(dict('view/metaViews', playlist.info.views), "</span>\n            </div>\n        ");

    if (playlist.info.isUnlisted) {
      div.querySelector('.yt-meta__title').innerHTML += "&nbsp;<span class=\"badge\">".concat(dict('playlist/unlisted'), "</span>");
    }

    return div;
  }

  function generateList(playlist) {
    var div = document.createElement('div');

    if (playlist.elements.length !== playlist.info.actualCount) {
      var err = document.createElement('div');
      err.classList.add('warn');
      err.innerHTML = "\n                <p>".concat(dict('playlist/exceeds100', playlist.info.actualCount), "</p>\n            ");
      div.append(err);
    }

    var ol = document.createElement('ol');
    div.append(ol);
    ol.classList.add('a11y-list', 'search-list');
    ol.setAttribute('style', 'margin: 0;');
    playlist.elements.forEach(function (el, i) {
      var li = document.createElement('li');
      li.classList.add('search-li');
      li.style.setProperty('--anim-stagger', i);
      var a = document.createElement('a');
      li.append(a);
      a.classList.add('search-card');
      a.href = "/".concat(el.videoId).concat(location.search);
      a.dataset.id = el.videoId;

      a.onclick = function (event) {
        if (yt.views && yt.views.videoReplace) {
          event.preventDefault();
          yt.views.videoReplace(a.dataset.id);
        }
      };

      a.setAttribute('title', el.title.simpleText);
      a.setAttribute('aria-label', el.title.simpleText);
      a.innerHTML = "\n                <div class=\"search-card-content\">\n                    <span class=\"search-card-entry\">".concat(el.title.simpleText, "</span>\n                    <span class=\"search-card-entry\">\n                        ").concat(dict('search/by', el.shortBylineText.runs[0].text), " \u2022\n                        ").concat(el.lengthText.simpleText, "\n                    </span>\n                </div>\n                <div class=\"search-card-cover\" style=\"background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url('").concat(el.thumbnail.thumbnails[0].url, "');\" aria-hidden>\n                    <span class=\"search-card-duration\">").concat(el.lengthText.simpleText, "</span>\n                </div>\n            ");
      ol.append(li);
    });
    return div;
  }
})();