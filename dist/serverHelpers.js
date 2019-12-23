"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLang = getLang;
exports.choose = choose;
exports.guard = guard;

/**
 * Returns a supported language
 * @param {Request} req - The request lol
 * @returns {string} A supported language
 * @author MindfulMinun
 * @since Oct 19, 2019
 * @version 0.1.0
 */
function getLang(req) {
  var supported = ['en-US', 'es-US', 'x-dummy'];
  var qLang = req.query.lang || '';
  var browser = req.acceptsLanguages(supported);

  if (supported.includes(qLang)) {
    return qLang;
  }

  if (browser) return browser;
  return 'en-US';
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