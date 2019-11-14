"use strict";

// index.js
var search = document.querySelector('input[type="text"]');
var rand = document.querySelectorAll('[data-random]');
var vids = ['ckRSn2zWt_o', // Shyness Boy
'VgUR1pna5cY', // Natural
'1iKZhsc8WGs', // Moe Shop - Charm
'0E5l2GHBxB8', // Stal
'dQw4w9WgXcQ' // get rickrolled lol
];
rand.forEach(function (el) {
  return el.href = choose(vids);
});
search.addEventListener('keypress', function (event) {
  if (event.key === "Enter") {
    window.location.href = "/search?q=".concat(encodeURIComponent(event.target.value));
  }
});
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