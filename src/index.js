// index.js
const search = document.querySelector('input[type="text"]')
const rand = document.querySelectorAll('[data-random]')

const vids = [
    'ckRSn2zWt_o', // Shyness Boy
    'VgUR1pna5cY', // Natural
    '1iKZhsc8WGs', // Moe Shop - Charm
    '0E5l2GHBxB8', // Stal
    'dQw4w9WgXcQ'  // get rickrolled lol
]

rand.forEach(el => el.href = choose(vids))

search.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        window.location.href = `/search?q=${encodeURIComponent(event.target.value)}`
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

/**
 * Selects a random element from an array
 * @param {Array} arr - The array to choose from
 * @returns {*} An element from the array
 * @author MindfulMinun
 * @since Oct 11, 2019
 * @version 1.0.0
 */
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
