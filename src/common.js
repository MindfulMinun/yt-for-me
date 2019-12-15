// Assert the global yt is defined
if (!yt) {
    throw Error("yt isn't defined, idk what to do.")
}

yt.langs = [{
    name: "English (US)",
    code: "en",
    full: "en-US"
}, {
    name: "Español (Estados Unidos)",
    code: "es",
    full: "es-US"
}];

// Matches a YouTube video id
yt.REGEX_CAPTURE_ID = /([a-zA-Z\d\-_]{11})/

function makeFooter() {
    const d = document.createElement('div')
    d.classList.add('with-love')
    d.classList.add('flex')
    d.innerHTML = `<p class="flex-stretch">${yt.dict.welcome.love}</p>`

    const s = document.createElement('select')
    d.appendChild(s)
    s.classList.add('yt-select')
    // s.name = 'lang'
    yt.langs.forEach(lang => {
        const o = document.createElement('option')
        o.value = lang.full
        o.innerText = lang.name
        if (lang.full === yt.lang) {
            o.selected = true
        }
        s.appendChild(o)
    })
    s.addEventListener('input', function () {
        let s = location.search
        s = s.replace(/(?:\?|\&)lang=[a-z\-_]+/gi, '')
        s += s ? '&' : '?'
        s += `lang=${this.value}`
        location.search = s
    })
    return d
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

// Promise.never returns a promise that never resolves
if (!Promise.never) {
    Promise.never = function () {
        return new Promise(() => {})
    }
}
