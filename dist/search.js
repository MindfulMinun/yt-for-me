"use strict";

(function () {
  'use strict'; // fetch('/api/search?q=tokyo+night+flyght&1').then(r => r.json()).then(console.log)
  // Called when a search request is made.

  function searchInit(query) {
    var searchParams = new URLSearchParams(location.search);

    if (query) {
      searchParams.set('q', query);
    }

    searchParams.set('page', +searchParams.get('page') || 1);
    var view = document.getElementById('view');

    if (searchParams.get('q').trim() === '') {
      view.innerHTML = "\n                <p>".concat(dict('search/emptySearch'), "</p>\n            ");
      return;
    }

    view.innerHTML = "\n            <p class=\"loading\">".concat(dict('search/loading', searchParams.get('q') || '...'), "</p>\n        ");
    fetch("/api/search?".concat(searchParams)).then(function (r) {
      return r.json();
    }).then(yt.rejectOnFetchErr).then(function (results) {
      document.title = dict('search/searchTitle', results.query);
      view.innerHTML = "\n                    <p class=\"fade-out\">".concat(dict('search/resultsFor', results.query), "</p>\n                ");
      var searchUl = document.createElement('ul');
      searchUl.classList.add('a11y-list', 'search-list', 'mobile-edge-flush');

      _appendToUl(results, searchUl);

      view.appendChild(searchUl);
      var wrapper = document.createElement('div');
      wrapper.classList.add('center');
      var loadMore = document.createElement('button');
      loadMore.classList.add('yt-btn', 'yt-btn--large');
      loadMore.innerText = 'Cargar más resultados';
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
      li.style.setProperty('--animation-order', i);
      var a = document.createElement('a');
      li.appendChild(a);
      a.classList.add('search-card');
      a.href = "/".concat(vid.videoId).concat(location.search);

      a.onclick = function (e) {
        var _this = this;

        // Start animation
        document.querySelector('main').classList.add('anim--fuck-this-shit-im-out'); // If a browser doesn't have animation events
        // or if the user doesn't like animations, navigate immediately

        var shouldWaitTillAnim = guard('AnimationEvent' in window && window.matchMedia, function (mm) {
          return mm('not all and (prefers-reduced-motion: reduce)').matches;
        }) || false;

        if (!shouldWaitTillAnim) {
          return;
        } // Otherwise, stop the navigation event


        e.preventDefault(); // Wait until the animation completes before navigating

        document.querySelector('main .search-list').addEventListener('animationend', function () {
          location.href = _this.href;
        }); // In case the event listener fails unexpectedly, navigate after 700ms

        setTimeout(function () {
          location.href = _this.href;
        }, 700);
      };

      a.setAttribute('title', vid.title);
      a.setAttribute('aria-label', vid.title);
      a.innerHTML = "\n                <div class=\"search-card-content\">\n                    <span class=\"search-card-entry\">".concat(vid.title, "</span>\n                    <span class=\"search-card-entry\">\n                        ").concat(dict('search/by', vid.author.name), " \u2022\n                        ").concat(dict('search/views', vid.views), "\n                    </span>\n                    <span class=\"search-card-entry\">\n                        ").concat(dict('search/relTime', vid.ago), "\n                    </span>\n                </div>\n                <div class=\"search-card-cover\" style=\"background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url('").concat(vid.thumb, "');\" aria-hidden>\n                    <span class=\"search-card-duration\">").concat(vid.duration.timestamp, "</span>\n                </div>\n            ");
      searchUl.appendChild(li);
    });
  } // Export the function to the global


  yt.views = yt.views || {};
  yt.views.searchInit = searchInit;
})();