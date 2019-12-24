"use strict";

(function () {
  'use strict'; // Assert the global yt is defined

  if (!yt) {
    throw Error("yt isn't defined, idk what to do.");
  } // Some locals for later
  //================================================================================
  //================================================================================
  //================================================================================


  var cont = document.querySelector('div.container'); // Listen for back/forward events
  // Bootstrap view handles view loading

  window.addEventListener('popstate', function (e) {
    console.log(e); // Anim the card out

    guard(document.querySelector('.view'), function (view) {
      return cont.classList.add('anim--fuck-this-shit-im-out');
    }); // If there's a state, load it.
    // Otherwise, the user was probably trying to go back.

    if (e.state && e.state !== (window.info && window.info.video_id)) {
      bootstrapView(e.state);
    } else {
      history.back();
    }
  }); // On page load, load the video the URL is currently at

  bootstrapView(guard(yt.REGEX_CAPTURE_ID.exec(location.pathname.slice(1) || ''), function (match) {
    return match[0];
  }) || ''); // Get video information required for loading the view

  function bootstrapView(id) {
    // Assert that the id is a YouTube id
    if (!yt.REGEX_CAPTURE_ID.test(id)) {
      // ID didn't match regex, something's wrong.
      cont.innerHTML = dict('errors/idAssertionFailed', id);
      cont.appendChild(makeFooter());
      return Promise.reject();
    }

    history.pushState(id, id, '/' + id + location.search); // Display a loading blob (blob = message before UI loads)

    var loading = document.createElement('p');
    loading.classList.add('loading');
    loading.innerHTML = choose(yt.dict.loadingBlobs);
    cont.prepend(loading); // Get video data

    return fetch("/api/info?id=".concat(id, "&lang=").concat(yt.dict.lang), {
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      return json.error ? Promise.reject(json) : json;
    }).then(function (info) {
      // Set the document title to the video title
      // (may be overwritten later)
      document.title = "".concat(info.title, " \u2022 yt-for-me"); // Prepare the content div for population

      cont.innerHTML = '';
      cont.classList.remove('anim--fuck-this-shit-im-out'); // Populate the div

      cont.appendChild(genView(info));
    })["catch"](function (err) {
      console.log(err); // If an error occurred, tell the user about it.

      cont.innerHTML = dict('errors/error400', err.error);
    })["finally"](function () {
      cont.appendChild(makeFooter());
    });
  } // Once we've recieved the vid data, generate the view


  function genView(info) {
    // Wrapper div yay
    var view = document.createElement('div');
    view.classList.add('view');
    view.classList.add('mobile-edge-flush'); // Cherry pick the properties we want from info and mod them here.
    // And expose the vid data into the global cuz why not

    var vid = cherryPickProperties(info);
    window.vid = vid;
    window.info = info;
    console.log('Video info (window.info):', info);
    console.log('Cherry-picked video properties (window.vid):', vid); // Overwrite the video title (neccesary if the vid's a music vid)

    document.title = "".concat(vid.title, " \u2022 yt-for-me"); // Construct the view

    view.innerHTML = "\n            <div class=\"yt\">\n                <details class=\"yt-dl\">\n                    <summary>".concat(dict('dlForm/label'), "</summary>\n                    <p>").concat(dict('dlForm/howTo'), "</p>\n                    <div class=\"yt-dl__mini-form\">\n                        <label id=\"label-audio\">\n                            ").concat(dict('dlForm/audioLabel'), ": \n                            <select class=\"yt-select yt-select--compact\" name=\"audioItag\" disabled>\n                                <option value=\"none\">").concat(dict('dlForm/kind/noAudio'), "</option>\n                            </select>\n                        </label>\n                        <label id=\"label-video\">\n                            ").concat(dict('dlForm/videoLabel'), ": \n                            <select class=\"yt-select yt-select--compact\" name=\"videoItag\" disabled>\n                                <option value=\"none\">").concat(dict('dlForm/kind/noVideo'), "</option>\n                            </select>\n                        </label>\n                        <label id=\"label-out\">\n                            ").concat(dict('dlForm/outLabel'), ": \n                            <select class=\"yt-select yt-select--compact\" name=\"outFormat\" disabled>\n                                <optgroup label=\"").concat(dict('dlForm/kind/onlyAudio'), "\">\n                                    <option value=\"mp3\">mp3</option>\n                                    <option value=\"acc\">acc</option>\n                                    <option value=\"ogg\">ogg</option>\n                                </optgroup>\n                                <optgroup label=\"").concat(dict('dlForm/kind/vidOrBoth'), "\">\n                                    <option value=\"mp4\" selected>mp4</option>\n                                    <option value=\"webm\">webm</option>\n                                    <option value=\"mpeg\">mpeg</option>\n                                    <option value=\"mov\">mov</option>\n                                </optgroup>\n                            </select>\n                        </label>\n                        <div>\n                            <button class=\"yt-btn\" disabled>").concat(dict('dlForm/dlLabel'), "</button>\n                        </div>\n                    </div>\n                </details>\n                <div class=\"yt-embed\">\n                    <iframe\n                        id=\"yt-iframe\"\n                        title=\"").concat(dict('view/iframeA11yLabel', info.title), "\" frameborder=\"0\"\n                        src=\"https://www.youtube.com/embed/").concat(info.video_id, "?autoplay=1&hl=").concat(yt.dict.lang, "\"\n                        allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\"\n                        allowfullscreen\n                    ></iframe>\n                </div>\n                <div class=\"yt-related\"></div>\n                <div class=\"yt-meta\">\n                    <span class=\"yt-meta__title\">").concat(vid.title, "</span>\n                </div>\n                <div class=\"yt-desc\">").concat(vid.description, "</div>\n            </div>\n        "); // Get the formats. Filter out the ones that are live or have both encodings.
    // Get formats that aren't live, and are either all audio or all video

    var filteredFormats = info.formats.filter(function (f) {
      return !f.live;
    }).partition(function (f) {
      return f.audioBitrate;
    }).flat(1); // Generate a table with the filtered formats

    view.querySelector('details').appendChild(createTable(filteredFormats)); // Add the format options in the dropdowns

    filteredFormats.forEach(function (format) {
      return;
      var select = [view.querySelector('#label-audio select'), view.querySelector('#label-video select')][format.audioEncoding ? 0 : 1];
      var option = document.createElement('option');
      var out = '';
      out += format.itag;
      out += ": ";
      out += format.audioEncoding || format.encoding;
      out += " (".concat(format.container, ")");
      option.innerText = "".concat(format.itag, ": ").concat(format.audioEncoding || format.encoding, " (").concat(format.container, ")").concat(format.audioSampleRate ? ' @ ' + Math.round(+format.audioSampleRate / 100) / 10 + 'kHz' : ' @ ' + format.qualityLabel);
      option.innerText = out;
      option.value = format.itag;
      select.appendChild(option);
    }); // Add the event listener to the dl button

    view.querySelector('.yt-dl__mini-form button').addEventListener('click', function (e) {
      this.disabled = true;
      var selects = Array.from(view.querySelectorAll('.yt-dl__mini-form select'));
      var out = {
        id: info.video_id
      };
      selects.map(function (el) {
        return [el.name, el.value];
      }).forEach(function (el) {
        out[el[0]] = el[1];
      });
      addToDownloadQueue(out);
    }); // Enable the dropdowns and the dl button

    view.querySelectorAll('.yt-dl__mini-form select, .yt-dl__mini-form button').forEach(function (el) {
      el.removeAttribute('disabled');
    }) // Add the video meta information
    ;

    (function () {
      var meta = view.querySelector('.yt-meta');
      vid.views && meta.appendChild(createMetaTag(dict('view/metaViews', vid.views)));
      info.published && meta.appendChild(createMetaTag(dict('view/metaPublished', info.published)));
      vid.author && meta.appendChild(createMetaTag(vid.album ? dict('view/metaAlbumAuthor', vid.album, vid.author) : dict('view/metaAuthor', vid.author)));
      vid.license && meta.appendChild(createMetaTag(dict('view/metaLicense', vid.license)));
    })(); // If the video falls under a certain category (i.e. "Music")
    // add a class to add neat little icon next to the video title


    guard(info.player_response, function (pr) {
      return guard(pr.microformat, function (mf) {
        return guard(mf.playerMicroformatRenderer, function (pmr) {
          return guard(pmr.category, function (category) {
            return view.querySelector('.yt-meta').dataset.category = category;
          });
        });
      });
    }); // Add the related video cards

    var rel = view.querySelector('.yt-related') // Add the "Return to search" card first
    ;

    (function (card) {
      card.href = '/search' + location.search;
      card.classList.add('yt-card');
      card.classList.add('yt-card--back-to-search');
      card.setAttribute('aria-label', dict('view/searchLabel'));
      card.innerHTML = "\n            <div class=\"yt-card--back-to-search__container\">\n                <i class=\"material-icons\">search</i>\n                <span class=\"yt-card-label\">".concat(dict('view/searchLabel'), "</span>\n            </div>\n        ");

      card.onclick = function (e) {
        return cont.classList.add('anim--fuck-this-shit-im-out');
      };

      rel.appendChild(card);
    })(document.createElement('a')) // Add the other related video cards
    ;

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

      card.classList.add('yt-card');
      card.style.setProperty('--card-bg-image', "url(https://img.youtube.com/vi/".concat(vid.id, "/mqdefault.jpg)"));
      card.innerHTML = "\n                <div class=\"yt-card--info\">\n                    <strong>".concat(vid.title, "</strong>\n                    <span>").concat(dict('view/cardAuthor', vid.author), "</span>\n                    <span>").concat(dict('view/cardViews', vid.short_view_count_text), "</span>\n                </div>\n            ");
      rel.appendChild(card);
    });
    view.querySelectorAll('[data-timestamp]').forEach(function (el) {
      el.onclick = function (e) {
        var iframe = document.getElementById('yt-iframe');
        if (!iframe) return;
        e.preventDefault();
        var url = new URL(iframe.src); // For every more significant group, multiply by powers of 60

        var timestamp = el.dataset.timestamp.split(':').reverse().map(function (a, i) {
          return +a * Math.pow(60, i);
        }).reduce(function (acc, v) {
          return acc + v;
        }); // Set the timestamp and replace the src

        url.searchParams.set('start', timestamp);
        iframe.src = url; // Scroll to the iframe so the user sees it

        scrollTo(0, 0);
      };
    });
    return view;
  }

  function cherryPickProperties(info) {
    var vid = {};
    var ps = info.player_response || {}; // Check media title (song title),
    // then check the microformat title (translated?)
    // then default the basic property

    vid.title = info.media && info.media[yt.dict.propertyLookup.song] || guard(ps.microformat, function (mf) {
      return guard(mf.playerMicroformatRenderer, function (r) {
        return guard(r.title, function (t) {
          return t.simpleText;
        });
      });
    }) || info.title;
    vid.id = info.video_id;
    vid.author = info.media && info.media[yt.dict.propertyLookup.artist] || info.author.name;
    vid.album = info.media && info.media[yt.dict.propertyLookup.album];
    vid.license = info.media && info.media[yt.dict.propertyLookup.license];
    vid.isExplicit = !!(info.media && info.media[yt.dict.propertyLookup.explicit]);
    vid.description = guard(ps.microformat, function (mf) {
      return guard(mf.playerMicroformatRenderer, function (pmr) {
        return guard(pmr.description, function (desc) {
          return desc.simpleText;
        });
      });
    }) || info.description;
    vid.description = vid.description.replace(yt.REGEX_URL, function (match) {
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
    }).replace(yt.REGEX_HASHTAG, function (match) {
      var q = new URLSearchParams(location.search);
      q.set('q', match);
      return "<a href=\"/search?".concat(q, "\">").concat(match, "</a>");
    }).replace(yt.REGEX_TIMESTAMP, function (match) {
      return "<a href=\"/".concat(vid.id, "\" data-timestamp=\"").concat(match, "\">").concat(match, "</a>");
    });
    vid.views = +ps.videoDetails.viewCount;
    return vid;
  }

  function createMetaTag(innerHTML) {
    var span = document.createElement('span');
    span.classList.add('yt-meta__data');
    span.innerHTML = innerHTML;
    return span;
  }

  function createTable(filteredFormats) {
    var div = document.createElement('div');
    var table = document.createElement('table');
    div.classList.add('yt-table');
    table.innerHTML = "\n            <thead>\n                <tr>\n                    <th>".concat(dict('dlForm/tableHeaders/kind'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/itag'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/encoding'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/container'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/resolution'), "</th>\n                    <th>").concat(dict('dlForm/tableHeaders/sampR8'), "</th>\n                </tr>\n            </thead>\n            <tbody></tbody>\n        ");
    var tbody = table.querySelector('tbody');
    filteredFormats.forEach(function (f) {
      var tr = document.createElement('tr');
      tr.innerHTML = "\n                <th>".concat(dict("dlForm/kind/".concat(f.audioEncoding ? 'audio' : 'video')), "</th>\n                <th>").concat(f.itag, "</th>\n                <th>").concat(f.audioEncoding || f.encoding, "</th>\n                <th>").concat(f.container, "</th>\n                <th>").concat(f.qualityLabel || '', "</th>\n                <th>").concat(f.audioSampleRate ? Math.round(+f.audioSampleRate / 100) / 10 + 'kHz' : '', "</th>\n            ");
      tbody.appendChild(tr);
    });
    div.appendChild(table);
    return div;
  }
})();