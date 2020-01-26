"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  'use strict'; // Assert the global yt is defined

  if (!yt) {
    throw Error("yt isn't defined, idk what to do.");
  } // Expose the videoInit function to the yt object


  yt.views = yt.views || {};
  yt.views.videoInit = videoInit;

  yt.views.videoReplace = function (id, wasReplaced) {
    document.getElementById('view').classList.add('anim--fuck-this-shit-im-out');
    yt.views.videoInit(id, wasReplaced);
  };

  function videoInit(videoId, wasReplaced) {
    var searchParams = new URLSearchParams(location.search);
    var view = document.getElementById('view');

    if (!yt.regexps.id.test(videoId)) {
      // ID didn't match regex, something's wrong.
      view.innerHTML = dict('errors/idAssertionFailed', {
        errCode: 0x32
      });
      return Promise.reject();
    }

    searchParams.set('v', videoId);

    if (!wasReplaced) {
      history.pushState({
        qi: yt.qi(),
        view: 'video',
        params: searchParams.toString(),
        id: videoId
      }, videoId, "/video?".concat(searchParams));
    }

    setLoading(view); // Get video data

    return fetch("/api/info?id=".concat(videoId, "&lang=").concat(yt.dict.lang), {
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (res) {
      return res.json();
    }).then(yt.rejectOnFetchErr).then(function (videoInfo) {
      // Set the document title to the video title
      // (may be overwritten later)
      document.title = "".concat(videoInfo.title, " \u2022 yt-for-me");
      window.info = videoInfo; // Prepare the content div for population

      view.innerHTML = '';
      view.classList.remove('anim--fuck-this-shit-im-out'); // Populate the div

      view.append(generateView(videoInfo));
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

  function generateView(videoInfo) {
    var ytContainer = document.createElement('div');
    ytContainer.classList.add('yt'); // Create the view

    ytContainer.append(generateYtDownloadForm(videoInfo), generateYtEmbed(videoInfo), generateYtRelated(videoInfo), generateYtMeta(videoInfo), generateYtDescription(videoInfo));
    var cherry = cherryPickProperties(videoInfo);
    window.cherry = cherry;
    document.title = "".concat(cherry.title, " \u2022 yt-for-me");
    return ytContainer;
  }

  function generateYtDownloadForm(videoInfo) {
    var details = document.createElement('details');
    details.classList.add('yt-dl');
    details.innerHTML = "\n            <summary>".concat(dict('dlForm/label'), "</summary>\n            <p>").concat(dict('dlForm/howTo'), "</p>\n            <div class=\"yt-dl__mini-form\">\n                <label id=\"label-audio\" class=\"flex\">\n                    <span class=\"yt-dl__txt-label\">").concat(dict('dlForm/audioLabel'), ":</span>\n                    <select class=\"yt-select yt-select--compact flex-stretch\" name=\"audioItag\" disabled>\n                        <option value=\"none\">").concat(dict('dlForm/kind/noAudio'), "</option>\n                    </select>\n                </label>\n                <label id=\"label-video\" class=\"flex\">\n                    <span class=\"yt-dl__txt-label\">").concat(dict('dlForm/videoLabel'), ":</span>\n                    <select class=\"yt-select yt-select--compact flex-stretch\" name=\"videoItag\" disabled>\n                        <option value=\"none\">").concat(dict('dlForm/kind/noVideo'), "</option>\n                    </select>\n                </label>\n                <label id=\"label-out\" class=\"flex\">\n                    <span class=\"yt-dl__txt-label\">").concat(dict('dlForm/outLabel'), ":</span>\n                    <select class=\"yt-select yt-select--compact flex-stretch\" name=\"outFormat\" disabled>\n                        <optgroup label=\"").concat(dict('dlForm/kind/onlyAudio'), "\">\n                            <option value=\"mp3\">mp3</option>\n                            <option value=\"acc\">acc</option>\n                            <option value=\"ogg\">ogg</option>\n                        </optgroup>\n                        <optgroup label=\"").concat(dict('dlForm/kind/vidOrBoth'), "\">\n                            <option value=\"mp4\" selected>mp4</option>\n                            <option value=\"webm\">webm</option>\n                            <option value=\"mpeg\">mpeg</option>\n                            <option value=\"mov\">mov</option>\n                        </optgroup>\n                    </select>\n                </label>\n                <div>\n                    <button class=\"yt-btn\" disabled>").concat(dict('dlForm/dlLabel'), "</button>\n                </div>\n            </div>\n        "); // Split the formats into video and audio

    var filteredFormats = videoInfo.formats // Exclude live formats
    .filter(function (f) {
      return !f.live;
    }) // Exclude mixed formats
    // We want only audio formats or only video formats
    .filter(function (f) {
      return !!f.audioQuality ^ !!f.qualityLabel;
    }).sort(function (l, r) {
      return r.audioBitrate - l.audioBitrate;
    }); // Split them into video and audio arrays

    var _filteredFormats$part = filteredFormats.partition(function (f) {
      return !f.audioQuality;
    }),
        _filteredFormats$part2 = _slicedToArray(_filteredFormats$part, 2),
        vids = _filteredFormats$part2[0],
        auds = _filteredFormats$part2[1]; // Add the format options in the dropdowns
    // TODO: These functions are very similar, refactor and reduce to a single function


    vids.forEach(function (format) {
      var select = details.querySelector('#label-video select');
      var option = document.createElement('option');
      var out = '';
      out += "".concat(format.itag, ": ");
      out += dict('dlForm/qualityHelper', format.quality, format.qualityLabel);
      out += " ".concat(format.container, " (").concat(format.codecs, ")");
      option.innerText = out;
      option.value = format.itag;
      select.append(option);
    });
    auds.forEach(function (format) {
      var select = details.querySelector('#label-audio select');
      var option = document.createElement('option');
      var out = '';
      out += "".concat(format.itag, ": ");
      out += dict('dlForm/qualityHelper', format.audioQuality, format.audioBitrate);
      out += " ".concat(format.container, " @ ").concat(Math.round(+format.audioSampleRate / 100) / 10);
      out += 'kHz';
      option.innerText = out;
      option.value = format.itag;
      select.append(option);
    }); // Add the event listener to the dl button

    details.querySelector('button').addEventListener('click', function (e) {
      this.disabled = true;
      var selects = Array.from(details.querySelectorAll('select'));
      var out = {
        id: info.video_id
      };
      selects.map(function (el) {
        return [el.name, el.value];
      }).forEach(function (el) {
        out[el[0]] = el[1];
      });
      document.querySelector('xyz-sheet').open();
      addToDownloadQueue(out);
    }); // Enable the dropdowns and download button

    details.querySelectorAll('select, button').forEach(function (el) {
      return el.removeAttribute('disabled');
    }); // Add the table

    details.append(createTable(filteredFormats));
    return details;
  }

  function generateYtEmbed(videoInfo) {
    var div = document.createElement('div');
    var iframe = document.createElement('iframe');
    div.classList.add('yt-embed');
    iframe.id = 'yt-iframe';
    iframe.setAttribute('title', dict('view/iframeA11yLabel', videoInfo.title));
    iframe.setAttribute('frameborder', 0);
    iframe.src = "https://www.youtube.com/embed/".concat(videoInfo.video_id, "?autoplay=1&hl=").concat(yt.dict.lang);
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', true); // Expose the iframe so we can manipulate it later

    yt.iframe = iframe;
    div.append(iframe);
    return div;
  }

  function generateYtRelated(videoInfo) {
    var related = document.createElement('div');
    related.classList.add('yt-related'); // First, add the "Return to search" button

    var backToSearch = document.createElement('a');
    backToSearch.href = '/search' + location.search;
    backToSearch.classList.add('yt-card', 'yt-card--back-to-search');
    backToSearch.setAttribute('aria-label', dict('view/searchLabel'));
    backToSearch.innerHTML = "\n            <div class=\"yt-card--back-to-search__container\">\n                <i class=\"material-icons\">search</i>\n                <span class=\"yt-card-label\">".concat(dict('view/searchLabel'), "</span>\n            </div>\n        ");
    backToSearch.style.setProperty('--anim-stagger', 0);

    backToSearch.onclick = function (e) {
      e.preventDefault();
      yt.views.searchReplace();
    };

    related.append(backToSearch);
    videoInfo.related_videos.forEach(function (vid, i) {
      if (vid.list) return;
      var card = document.createElement('a');
      card.href = '/' + vid.id + location.search;
      card.dataset.id = vid.id;

      card.onclick = function (e) {
        e.preventDefault();
        yt.views.videoReplace(this.dataset.id);
      };

      card.classList.add('yt-card');
      card.style.setProperty('--card-bg-image', "url(https://img.youtube.com/vi/".concat(vid.id, "/mqdefault.jpg)"));
      card.style.setProperty('--anim-stagger', i + 1);
      card.innerHTML = "\n                <div class=\"yt-card--info\">\n                    <strong>".concat(vid.title, "</strong>\n                    <span>").concat(dict('view/cardAuthor', vid.author), "</span>\n                    <span>").concat(dict('view/cardViews', vid.short_view_count_text), "</span>\n                </div>\n            ");
      related.append(card);
    });
    return related;
  }

  function generateYtMeta(videoInfo) {
    var meta = document.createElement('div');
    var cherry = cherryPickProperties(videoInfo);
    meta.classList.add('yt-meta'); // Set the title

    meta.innerHTML = "<span class=\"yt-meta__title\">".concat(cherry.title, "</span>") // Set the other info properties
    ;
    cherry.views != null && meta.append(_createMetaTag(dict('view/metaViews', cherry.views)));
    videoInfo.published && meta.append(_createMetaTag(dict('view/metaPublished', videoInfo.published)));
    cherry.author && meta.append(_createMetaTag(cherry.albumUrl ? dict('view/metaAlbumAuthor', cherry.albumUrl, cherry.artistUrl) : dict('view/metaAuthor', cherry.author)));
    cherry.license && meta.append(_createMetaTag(dict('view/metaLicense', cherry.license))); // Set the category as a data-* property

    guard(safeLookup(info.player_response, ['microformat', 'playerMicroformatRenderer', 'category']), function (category) {
      return meta.dataset.category = category;
    });
    meta.querySelectorAll('a').forEach(function (el) {
      el.onclick = function (event) {
        return document.getElementById('view').classList.add('anim--fuck-this-shit-im-out');
      };
    });
    return meta;
  }

  function generateYtDescription(videoInfo) {
    var cherry = cherryPickProperties(videoInfo);
    var desc = document.createElement('div');
    desc.classList.add("yt-desc");

    if (!cherry.description) {
      desc.innerHTML = "<em class=\"yt-meta__data\">".concat(dict('view/noDesc'), "</em>");
      return desc;
    }

    desc.innerHTML = cherry.description;
    desc.querySelectorAll('a[data-timestamp]').forEach(function (el) {
      el.onclick = function (event) {
        var frame = yt.iframe || document.getElementById('yt-iframe');
        if (!frame) return;
        event.preventDefault();
        var url = new URL(frame.src);
        url.searchParams.set('start', +el.dataset.timestamp);
        frame.src = url; // Scroll to the iframe so the user sees it

        window.scrollTo && window.scrollTo(0, 0);
      };
    });
    return desc;
  }

  function createTable(filteredFormats) {
    var div = document.createElement('div');
    var table = document.createElement('table');
    div.classList.add('yt-table');
    table.innerHTML = "\n            <thead>\n                <tr>\n                    <th>".concat(dict('dlForm/tableHeaders/kind'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/itag'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/container'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/codecs'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/quality'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/sampR8'), "</th>\n                </tr>\n            </thead>\n            <tbody></tbody>\n        ");
    var tbody = table.querySelector('tbody');
    filteredFormats.forEach(function (f) {
      var tr = document.createElement('tr');
      tr.innerHTML = "\n                <th>".concat(dict("dlForm/kind/".concat(f.audioQuality ? 'audio' : 'video')), "</th>\n                <th>").concat(f.itag, "</th>\n                <th>").concat(f.container, "</th>\n                <th>").concat(f.codecs, "</th>\n                <th>").concat(f.audioQuality ? dict('dlForm/qualityHelper', f.audioQuality, f.audioBitrate) : dict('dlForm/qualityHelper', f.quality, f.qualityLabel), "</th>\n                <th>").concat(f.audioSampleRate ? Math.round(+f.audioSampleRate / 100) / 10 + 'kHz' : '', "</th>\n            ");
      tbody.append(tr);
    });
    div.append(table);
    return div;
  }

  function cherryPickProperties() {
    var videoInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var vid = {}; // Check media title (song title),
    // then check the microformat title (translated?)
    // then default the basic property

    vid.title = safeLookup(videoInfo.media, [yt.dict.propertyLookup.song]) || safeLookup(videoInfo, ['player_response', 'microformat', 'playerMicroformatRenderer', 'title', 'simpleText']) || videoInfo.title;
    vid.id = videoInfo.video_id;
    vid.author = safeLookup(videoInfo.media, [yt.dict.propertyLookup.artist]) || safeLookup(videoInfo.player_response, ['videoDetails', 'author']) || safeLookup(videoInfo.author, ['name']);
    vid.album = safeLookup(videoInfo, ['media', yt.dict.propertyLookup.album]);

    if (vid.album && vid.author) {
      var params = new URLSearchParams(location.search);
      params.set('q', "".concat(vid.author, " ").concat(vid.album));
      vid.albumUrl = "<a href=\"/search?".concat(params, "\">").concat(vid.album, "</a>");
      params.set('q', vid.author);
      vid.artistUrl = "<a href=\"/search?".concat(params, "\">").concat(vid.author, "</a>");
    }

    vid.license = safeLookup(videoInfo.media, [yt.dict.propertyLookup.license]);
    vid.isExplicit = !!safeLookup(videoInfo.media, [yt.dict.propertyLookup.explicit]);
    vid.description = safeLookup(videoInfo.player_response, ['microformat', 'playerMicroformatRenderer', 'description', 'simpleText']) || videoInfo.description;
    vid.description = _parseDescription(vid.description);
    vid.views = +safeLookup(videoInfo.player_response, ['videoDetails', 'viewCount']);
    vid.ldRatio = NaN;

    if (safeLookup(videoInfo.player_response, ['videoDetails', 'allowRatings'])) {
      vid.ldRatio = guard(safeLookup(videoInfo.player_response, ['videoDetails', 'averageRating']), function (ld) {
        return ld / 5 * 100;
      }) || NaN;
    }

    return vid;
  }

  function _parseDescription() {
    var desc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return desc.replace(yt.regexps.url, function (match) {
      var url;

      try {
        url = new URL(match);
      } catch (e) {
        // If the regex matched but it couldn't be parsed by URL,
        // give up parsing
        console.log("Warning: Matched \u201C".concat(match, "\u201D but marked as invalid by URL constructor"));
        return match;
      }

      var out = "<a href=\"".concat(match, "\" target=\"_blank\">");
      out += url.hostname.replace(/^www\./, '');
      out += url.pathname !== '/' && url.pathname || '';
      out += '</a>';
      return out;
    }).replace(yt.regexps.hashtag, function (match) {
      var q = new URLSearchParams(location.search);
      q.set('q', match);
      return "<a href=\"/search?".concat(q, "\">").concat(match, "</a>");
    }).replace(yt.regexps.timestamp, function (match) {
      var seconds = match.split(':').reverse().map(function (a, i) {
        return +a * Math.pow(60, i);
      }).reduce(function (acc, v) {
        return acc + v;
      }, 0);
      return "<a href=\"#\" data-timestamp=\"".concat(seconds, "\">").concat(match, "</a>");
    });
  }

  function _createMetaTag(innerHTML) {
    var span = document.createElement('span');
    span.classList.add('yt-meta__data');
    span.innerHTML = innerHTML;
    return span;
  }
})();