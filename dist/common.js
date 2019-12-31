"use strict";

// Assert the global yt is defined
if (!yt) {
  throw Error("yt isn't defined, idk what to do.");
}

yt.langs = [{
  name: "English (US)",
  code: "en",
  full: "en-US"
}, {
  name: "Español (Estados Unidos)",
  code: "es",
  full: "es-US"
}]; // Matches a YouTube video id

yt.REGEX_CAPTURE_ID = /([a-zA-Z\d\-_]{11})/; // Matches a url?

yt.REGEX_URL = /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g; // Matches a hashtag?

yt.REGEX_HASHTAG = /\B(#[a-zA-Z0-9\-_.]+)\b(?!#)/g; // Matches a timestamp?

yt.REGEX_TIMESTAMP = /\b(\d+(?::\d{2})(?::\d{2})?)\b/g;
ready(function () {
  // If the sheet already exists, do not create a duplicate sheet.
  if (document.querySelector('xyz-sheet')) {
    return;
  }

  var sheet = document.createElement('xyz-sheet'); // sheet.setAttribute('peek', true)

  sheet.innerHTML = "\n        <div slot=\"peek\" class=\"flex\">\n            <span class=\"flex-stretch\">".concat(dict('dlSheet/labelDefault'), "</span>\n            <i class=\"material-icons\">menu</i>\n        </div>\n        <div id=\"slot-content\" data-empty=\"true\">\n            <p>").concat(dict('dlSheet/idle'), "</p>\n        </div>\n    ");
  document.body.append(sheet);
});

function addToDownloadQueue(object) {
  // Peek the sheet if not already visible
  document.querySelector('xyz-sheet').setAttribute('peek', true);
  document.querySelector('xyz-sheet').open();
  createDownloadListItem(object);
  fetch('/api/download', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  }).then(function (r) {
    return r.json();
  }).then(function (json) {
    Object.assign(object, json); // Add the dl object to localStorage

    var s = JSON.parse(localStorage.getItem('yt-dl-queue') || '[]');
    s.unshift(object);
    localStorage.setItem('yt-dl-queue', JSON.stringify(s));

    if (json.error) {
      return;
    }
  });
}

function pollUrl(object, callback) {
  if (!object.poll) {
    setTimeout(function () {
      return pollUrl(object, callback);
    }, 1000);
    return;
  }

  var guardFinished = false;
  return fetch(object.poll).then(function (r) {
    return r.json();
  }).then(function (progress) {
    if (progress.error || progress.errCode) {
      callback(progress);
      return Promise.reject(progress);
    } else {
      callback(null, progress);
      guardFinished = progress.finished;
      return progress;
    }
  }).then(function () {
    if (!guardFinished) {
      setTimeout(function () {
        return pollUrl(object, callback);
      }, 1000);
    }
  })["catch"](function (json) {
    return callback(json);
  });
}

function createDownloadListItem(object) {
  var sheetContent = document.getElementById('slot-content');
  var ul = sheetContent.querySelector('ul');

  if (!ul) {
    sheetContent.innerHTML = "\n            <ul class=\"a11y-list\"></ul>\n        ";
    return createDownloadListItem(object);
  }

  var li = document.createElement('li');
  var txt = document.createElement('span');
  var xyzProg = document.createElement('xyz-progress');
  li.classList.add('dl-list-element');
  txt.textContent = "".concat(object.id, ": ").concat(dict('dlSheet/states/starting'));
  li.append(txt);
  li.append(xyzProg);
  ul.prepend(li);
  pollUrl(object, function (err, json) {
    if (err) {
      console.error(err);
      return;
    }

    console.log(json);

    if (json.finished) {
      txt.textContent = "\n                ".concat(object.id, ": ").concat(dict('dlSheet/states/done'), "\n            ");
      var a = document.createElement('a');
      a.setAttribute('target', 'blank');
      a.href = json.url;
      a.innerText = dict('dlSheet/dlLabel');
      txt.append(a);
      xyzProg.setAttribute('value', 1);
      return;
    }

    if (json.merge) {
      xyzProg.setAttribute('value', json.merge.progress);
      txt.textContent = "\n                ".concat(object.id, ": ").concat(dict('dlSheet/states/converting'), "\n                ").concat(dict('dlSheet/percentage', json.merge.progress), "\n            ");
      return;
    }

    var progresses = [json[object.audioItag], json[object.videoItag]].filter(function (x) {
      return !!x;
    }).map(function (p) {
      return p.progress;
    });

    if (!progresses.length) {
      return;
    }

    var progression = progresses.reduce(function (acc, v) {
      return acc + v;
    }) / progresses.length;
    txt.textContent = "\n            ".concat(object.id, ": ").concat(dict('dlSheet/states/downloading'), " ").concat(dict('dlSheet/percentage', progression), "\n        ");
    xyzProg.setAttribute('value', progression);
  });
}

function makeFooter() {
  var d = document.createElement('div');
  d.classList.add('with-love');
  d.classList.add('flex');
  d.innerHTML = "<p class=\"flex-stretch\">".concat(yt.dict.welcome.love, "</p>");
  var s = document.createElement('select');
  s.setAttribute('aria-label', yt.dict.welcome.languageA11yLabel);
  d.append(s);
  s.classList.add('yt-select'); // s.name = 'lang'

  yt.langs.forEach(function (lang) {
    var o = document.createElement('option');
    o.value = lang.full;
    o.textContent = lang.name;

    if (lang.full === yt.lang) {
      o.selected = true;
    }

    s.append(o);
  });
  s.addEventListener('input', function () {
    var s = location.search;
    s = s.replace(/(?:\?|\&)lang=[a-z\-_]+/gi, '');
    s += s ? '&' : '?';
    s += "lang=".concat(this.value);
    location.search = s;
  });
  return d;
}
/**
 * Decaffeinate-style guard
 * @param {*} what - The thing that might be null or undefined
 * @param {function} mod - The modifier
 * @returns {*} The return value of your function or undefined if nullish
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 0.1.0
 */


function guard(what, mod) {
  return typeof what !== 'undefined' && what !== null ? mod(what) : void 0;
}

function dict(what) {
  var path = what.split('/');
  var prop,
      dict = yt.dict;

  while (prop = path.shift()) {
    dict = guard(dict, function () {
      return dict[prop];
    }) || undefined;
  } // If the property is undefined~ish, log a warning


  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  if (null == dict) {
    console.warn("Error: Entrada del diccionario en \"".concat(what, "\" es nulo or no definido. En cambio se devolvi\xF3 la ruta."));
    return [what].concat(params).join(' ');
  } // If it's a string, return it


  if ("string" == typeof dict) {
    return dict;
  } // If it's a function, call it with the passed parameters


  if ("function" === typeof dict) {
    return dict.apply(void 0, params);
  } // If it's not a string or a function, there's some other kind of error


  console.warn("Expected the entry at ".concat(what, " to resolve to a string."));
  return what;
}
/**
 * Calls a function when the document is ready
 * @param {Function} fn - The function to call
 * @author MindfulMinun
 * @since Dec 16, 2019
 * @version 0.1.0
 */


function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 0.1.0
 */


function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
} // Promise.never returns a promise that never resolves


if (!Promise.never) {
  Promise.never = function () {
    return new Promise(function () {});
  };
} // Array::partition divides an array in two


if (!Array.prototype.partition) {
  Array.prototype.partition = function (f) {
    var matched = [],
        unmatched = [],
        i = 0,
        j = this.length;

    for (; i < j; i++) {
      (f.call(this, this[i], i) ? matched : unmatched).push(this[i]);
    }

    return [matched, unmatched];
  };
}