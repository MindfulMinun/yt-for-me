"use strict";

// index.js
var rand = document.querySelectorAll('[data-random]');
var main = document.querySelector('main');
var vids = ['ckRSn2zWt_o', // Shyness Boy
'VgUR1pna5cY', // Natural
'1iKZhsc8WGs', // Moe Shop - Charm
'0E5l2GHBxB8', // Stal
'dQw4w9WgXcQ' // get rickrolled lol
];
rand.forEach(function (el) {
  return el.href = choose(vids) + location.search;
});
main.appendChild(makeFooter());