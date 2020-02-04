"use strict";

(function () {
  'use strict'; // fetch('/api/search?q=tokyo+night+flyght&1').then(r => r.json()).then(console.log)
  // Export the function to the global

  yt.views = yt.views || {};
  yt.views.searchInit = searchInit;

  yt.views.searchReplace = function (query, wasReplaced) {
    document.getElementById('view').classList.add('anim--fuck-this-shit-im-out');
    yt.views.searchInit(query, wasReplaced);
  }; // Called when a search request is made.


  function searchInit(query, wasReplaced) {
    var searchParams = yt.cleanUpSearchParams();

    if (query) {
      searchParams.set('q', query);
    }

    query = searchParams.get('q') || '';

    if (!wasReplaced) {
      history.pushState({
        qi: yt.qi(),
        view: 'search',
        params: searchParams.toString(),
        id: null
      }, dict('search/searchTitle', query), "/search?".concat(searchParams));
    }

    searchParams.set('page', +searchParams.get('page') + 1);
    var view = document.getElementById('view');

    if (!query || query.trim() === '') {
      view.classList.add('search--empty-state');
      view.classList.remove('anim--fuck-this-shit-im-out');
      view.innerHTML = "\n                <img src=\"/icons/lupa.svg\" alt=\"\" class=\"search__lupa fade-in-out\">\n                <h3 class=\"search-empty__title fade-in-out\">".concat(dict('search/emptySearchTitle'), "</h3>\n                <p class=\"fade-in-out\">").concat(dict('search/emptySearch'), "</p>\n            ");
      view.querySelectorAll('[data-random]').forEach(function (el) {
        el.dataset.id = choose(yt.squiggleBooty);
        el.href = el.dataset.id + location.search;

        el.onclick = function (event) {
          return yt.views.videoReplace(el.dataset.id);
        };
      });
      return;
    }

    view.insertAdjacentHTML('afterbegin', "\n            <p class=\"loading\">".concat(dict('search/loading', query || '...'), "</p>\n        "));
    fetch("/api/search?".concat(searchParams)).then(function (r) {
      return r.json();
    }).then(yt.rejectOnFetchErr).then(function (results) {
      document.title = dict('search/searchTitle', results.query);
      view.innerHTML = "\n                    <p class=\"fade-out\">".concat(dict('search/resultsFor', results.query), "</p>\n                ");
      var searchUl = document.createElement('ul');
      searchUl.classList.add('a11y-list', 'search-list', 'mobile-edge-flush');
      view.classList.remove('anim--fuck-this-shit-im-out', 'search--empty-state');

      _appendToUl(results, searchUl);

      view.appendChild(searchUl);
      var wrapper = document.createElement('div');
      wrapper.classList.add('center');
      var loadMore = document.createElement('button');
      loadMore.classList.add('yt-btn', 'yt-btn--large');
      loadMore.innerText = dict('search/loadMore');
      loadMore.addEventListener('click', function (event) {
        // Disable the button while the search is being performed
        loadMore.setAttribute('disabled', 'disabled'); // Load the results and disable the button again

        _loadMore(searchUl, searchParams).then(function () {
          loadMore.removeAttribute('disabled');
        });
      });
      wrapper.appendChild(loadMore);
      view.appendChild(wrapper);
    })["catch"](function (err) {
      view.innerHTML = dict('errors/searchErr', err);
    });
  }

  function _loadMore(ul, searchParams) {
    // Increase the page number
    searchParams.set('page', +searchParams.get('page') + 1); // Search and add the results to the ul

    return fetch("/api/search?".concat(searchParams)).then(function (r) {
      return r.json();
    }).then(yt.rejectOnFetchErr).then(function (results) {
      return _appendToUl(results, ul);
    });
  }

  function _appendToUl(results, searchUl) {
    results.vids.forEach(function (vid, i) {
      var li = document.createElement('li');
      li.classList.add('search-li');
      li.style.setProperty('--anim-stagger', i);
      var a = document.createElement('a');
      li.appendChild(a);
      a.classList.add('search-card');
      a.href = "/".concat(vid.videoId).concat(location.search);
      a.dataset.id = vid.videoId;

      a.onclick = function (event) {
        if (yt.views && yt.views.videoReplace) {
          event.preventDefault();
          yt.views.videoReplace(a.dataset.id);
        }
      };

      a.setAttribute('title', vid.title);
      a.setAttribute('aria-label', vid.title);
      a.innerHTML = "\n                <div class=\"search-card-content\">\n                    <span class=\"search-card-entry\">".concat(vid.title, "</span>\n                    <span class=\"search-card-entry\">\n                        ").concat(dict('search/by', vid.author.name), " \u2022\n                        ").concat(dict('search/views', vid.views), "\n                    </span>\n                    <span class=\"search-card-entry\">\n                        ").concat(dict('search/relTime', vid.ago), "\n                    </span>\n                </div>\n                <div class=\"search-card-cover\" style=\"background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url('").concat(vid.thumb, "');\" aria-hidden>\n                    <span class=\"search-card-duration\">").concat(vid.duration.timestamp, "</span>\n                </div>\n            ");
      searchUl.appendChild(li);
    });
  }
})();