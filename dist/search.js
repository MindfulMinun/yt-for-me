"use strict";

var search = document.querySelector('input[type="text"]');
search.addEventListener('keypress', function (event) {
  if (event.key === "Enter") {
    window.location.href = "/search?q=".concat(encodeURIComponent(event.target.value));
  }
});