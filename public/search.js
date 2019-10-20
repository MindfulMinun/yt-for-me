// search.js
const search = document.querySelector('input[type="text"]')

search.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        const test = /([a-zA-Z0-9\-\_]{11})/.exec(event.target.value)
        guard(test && test[1], id => {
            window.location.href += id
        })
    }
})

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
    return (typeof what !== 'undefined' && what !== null) ? mod(what) : void 0;
}
