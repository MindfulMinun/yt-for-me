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

// Matches a url?
yt.REGEX_URL = /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g

// Matches a hashtag?
yt.REGEX_HASHTAG = /\B(#[a-zA-Z0-9\-_.]+)\b(?!#)/g

// Matches a timestamp?
yt.REGEX_TIMESTAMP = /\b(\d+(?::\d{2})(?::\d{2})?)\b/g


ready(function () {
    // If the sheet already exists, do not create a duplicate sheet.
    if (document.querySelector('xyz-sheet')) { return }

    const sheet = document.createElement('xyz-sheet')
    sheet.setAttribute('peek', true)

    sheet.innerHTML = `
        <div slot="peek" class="flex">
            <span class="flex-stretch">${dict('dlSheet/labelDefault')}</span>
            <i class="material-icons">menu</i>
        </div>
        <div id="slot-content" data-empty="true">
            <p>${dict('dlSheet/idle')}</p>
        </div>
    `
    
    document.body.appendChild(sheet)
})

function addToDownloadQueue(object) {
    // Peek the sheet if not already visible
    document.querySelector('xyz-sheet').setAttribute('peek', true)

    fetch('/api/download', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then(r => r.json()).then(json => {

        Object.assign(object, json)

        // Add the dl object to localStorage
        const s = JSON.parse(localStorage.getItem('yt-dl-queue') || '[]')
        s.unshift(object)
        localStorage.setItem('yt-dl-queue', JSON.stringify(s))
        console.log(s)

        createDownloadListItem(object)
        
        if (json.error) { return }
    })

}

function pollUrl(url) {
    return fetch(url)
        .then(r => r.json())
        .then(j => console.log(JSON.stringify(j, null, 2)))
        .then(() => {
            setTimeout(() => pollUrl(url), 700)
        })
}

function createDownloadListItem(object) {
    const sheetContent = document.getElementById('slot-content')
    const ul = sheetContent.querySelector('ul')
    if (!ul) {
        sheetContent.innerHTML = `
            <ul class="a11y-list"></ul>
        `
        return createDownloadListItem(object)
    }
    const li = document.createElement('li')
    li.classList.add('dl-list-element')
    li.innerHTML = 'hi'
    ul.appendChild(li)

    pollUrl(object)
}

function makeFooter() {
    const d = document.createElement('div')
    d.classList.add('with-love')
    d.classList.add('flex')
    d.innerHTML = `<p class="flex-stretch">${yt.dict.welcome.love}</p>`

    const s = document.createElement('select')
    s.setAttribute('aria-label', yt.dict.welcome.languageA11yLabel)
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
 * @version 0.1.0
 */
function guard(what, mod) {
    return (typeof what !== 'undefined' && what !== null) ? mod(what) : void 0;
}


function dict(what, ...params) {
    const path = what.split('/')
    let prop, dict = yt.dict
    while (prop = path.shift()) {
        dict = guard(dict, () => dict[prop]) || undefined
    }
    
    // If the property is undefined~ish, log a warning
    if (null == dict) {
        console.warn(`Error: Dictionary property at "${what}" was null or undefined. Returned the path instead.`)
        return [what, ...params].join(' ')
    }

    // If it's a string, return it
    if ("string" == typeof dict) {
        return dict
    }

    // If it's a function, call it with the passed parameters
    if ("function" === typeof dict) {
        return dict(...params)
    }

    // If it's not a string or a function, there's some other kind of error
    console.warn(`Expected the entry at ${what} to resolve to a string.`)
    return what
}

/**
 * Calls a function when the document is ready
 * @param {Function} fn - The function to call
 * @author MindfulMinun
 * @since Dec 16, 2019
 * @version 0.1.0
 */
function ready(fn) {
    if (document.readyState != 'loading'){
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
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
    return arr[Math.floor(Math.random() * arr.length)]
}

// Promise.never returns a promise that never resolves
if (!Promise.never) {
    Promise.never = function () {
        return new Promise(() => {})
    }
}

// Array::partition divides an array in two
if (!Array.prototype.partition) {
    Array.prototype.partition = function (f) {
        let matched = [],
            unmatched = [],
            i = 0,
            j = this.length

        for (; i < j; i++){
            (f.call(this, this[i], i) ? matched : unmatched).push(this[i]);
        }

        return [matched, unmatched]
    }
}
