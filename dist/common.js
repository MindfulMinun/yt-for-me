"use strict";

yt.langs = [{
  name: "English",
  code: "en",
  full: "en-US"
}, {
  name: "Español",
  code: "es",
  full: "es-MX"
}];

function makeFooter() {
  var d = document.createElement('div');
  d.classList.add('with-love');
  d.classList.add('flex');
  d.innerHTML = "<p class=\"flex-stretch\">".concat(yt.dict.welcome.love, "</p>");
  var s = document.createElement('select');
  d.appendChild(s);
  s.classList.add('yt-select');
  yt.langs.forEach(function (lang) {
    var o = document.createElement('option');
    o.value = lang.code;
    o.innerText = lang.name;

    if (lang.code === yt.lang) {
      o.selected = true;
    }

    s.appendChild(o);
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
 * @version 1.0.0
 */


function guard(what, mod) {
  return typeof what !== 'undefined' && what !== null ? mod(what) : void 0;
}
/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */


function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}