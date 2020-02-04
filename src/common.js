// Assert the global yt is defined
if (!yt) {
    throw Error("yt isn't defined, idk what to do.")
}

// Declare accepted languages
yt.langs = [{
    name: "English (US)",
    code: "en",
    full: "en-US"
}, {
    name: "Español (Estados Unidos)",
    code: "es",
    full: "es-US"
}];

// Declare regexes
yt.regexps = {
    id: /([a-zA-Z\d\-_]{11})/,
    url: /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    hashtag: /\B(#[a-zA-Z0-9\-_.]+)\b(?!#)/g,
    timestamp: /\b(\d+(?::\d{2})(?::\d{2})?)\b/g
}

// Random videos (songs) in case the user doesn't know what to play
yt.squiggleBooty = [
    // https://www.youtube.com/playlist?list=PLIm1cC9KsS_0AvI3B30PikS7A2k_puXTr
    'j3LHAt7jp68', // Android52 - Future Groove Product - Future Groove
    '63EAaS19NI4', // Android52 - Future Groove Product - Melt City
    'CGIOSIk5IJk', // Android52 - Future Groove Product - Everyday
    '94IN5JsR6Lw', // Android52 - Ultra Groove Product - Fall in Love
    'ckRSn2zWt_o', // Anri - Shyness Boy
    'wYY-XUXHofs', // Breakbot - Why (con Ruckazoid)
    '69oj-ISqaOA', // Cowboy Bebop - Jupiter Jazz
    'irbdwyEjF3M', // D-Real - Candy
    '8Vpzha5PzLg', // D-Real - It's Your Day
    'yfHzzXlSTxI', // D-Real - Just Bought a Dragon Maid
    'IRW3R_ATpKo', // Dark Cat - Crazy Milk
    '0RmNN1AFsbA', // Dark Cat - Maple Adventure
    'doRlssu0SEo', // Diveo - Daddy Like (Remix)
    'mUqgaE99L94', // Diveo - Hoverboard
    'Y0-92nVrK7c', // Diveo - Say Goodbye
    'H-AfGh8gmiQ', // Garoad - Every Day is Night
    'OJQyTnD74gk', // Gorillaz - Doncamatic (con Daley)
    '6gIXh0-e2R0', // Gyari - Moonlight Stage 10-year cover
    'xLQWFNZ-wIc', // Hopeful Romantics - Why Wont You Reach For Me
    'QNxfYXYIyLc', // Jamie Paige - Apple Shampoo (Remix)
    'znphh0fB-gA', // Jamie Paige - Swag pt. 2: Gumi Megpoid Gets Real (with Ricco Harver)
    'Wmlp3hiD6QA', // Jamie Paige - Anew, Again - Adelaide Delays
    'kDHWcv0whNY', // Jamie Paige - Autumn Every Day - To Atlantis
    'TfnRTifSWh0', // Madeon - Good Faith - Be Fine
    'D_EnyikMsEU', // Madeon - Good Faith - No Fear No More
    'omab6QAwBCA', // Marc Rebillet - Funk Emergency
    'LzWjdtTN3VM', // Marsy - Je N'ai Plus Confiance En Toi
    'ZwqOJlZ9Pc4', // Moe Shop - Tokyo Night Flyght (Remix)
    'VgUR1pna5cY', // Moe Shop - Natural
    'l2nbIwDj7iY', // Moe Shop - Moshi Moshi - Crosstalk
    'fkuynpzI3bI', // Moe Shop - Pure Pure - Say
    'FFyZzEJuymg', // Naz3nt - Love Taste (Remix)
    'yD2FSwTy2lw', // No one's around to help
    'dQw4w9WgXcQ'  // get rickrolled lol
]

// The order of query parameters
yt.queryParamsOrder = ['v', 'q', 'lang']

yt.sortQueryParams = (a, b) => {
    // Get the index based on the order
    
    a = yt.queryParamsOrder.indexOf(a[0])
    b = yt.queryParamsOrder.indexOf(b[0])

    // The unknown query parameters should be last no matter what
    a = a === -1 ? Infinity : a
    b = b === -1 ? Infinity : b

    return a - b
}

// Cleans up the search paramaters and puts them in the order above.
// Unknown parameters get placed at the end. Returns URLSearchParams
yt.cleanUpSearchParams = () => {
    const s = new URLSearchParams('');
    [...new URLSearchParams(location.search).entries()]
        .filter(pair => !!pair[1])
        .sort(yt.sortQueryParams)
        .forEach(el => s.set(el[0], el[1]))
    return s
}

// Helper function for handling errors in fetch events
yt.rejectOnFetchErr = r => (r.error || r.errCode) ? Promise.reject(r) : Promise.resolve(r)

// Use a random string to handle history events
yt.qi = () => Math.random().toString(36).substr(2, 5)

ready(function () {
    // Routing
    window.addEventListener('popstate', event => {
        if (event.state) {
            switch (event.state.view) {
                case 'video':  return yt.views.videoReplace(event.state.id, true)
                case 'search': return yt.views.searchReplace(null, true)
            }
        } else {
            history.back()
        }
    }, false);

    // If the sheet already exists, do not create a duplicate sheet.
    if (document.querySelector('xyz-sheet')) { return }

    const sheet = document.createElement('xyz-sheet')
    const form = document.querySelector('form')
    // sheet.setAttribute('peek', true)

    sheet.innerHTML = `
        <div slot="peek" class="flex">
            <span class="flex-stretch">${dict('dlSheet/labelDefault')}</span>
            <i class="material-icons">menu</i>
        </div>
        <div id="slot-content" data-empty="true">
            <p>${dict('dlSheet/idle')}</p>
        </div>
    `
    
    const lang = new URLSearchParams(location.search).get('lang')
    if (lang) {
        const langInput = document.createElement('input')
        langInput.type = 'hidden'
        langInput.name = 'lang'
        langInput.value = lang
    
        form.appendChild(langInput)
    }

    form.onsubmit = e => {
        if (yt.views && yt.views.searchReplace) {
            e.preventDefault()
            yt.views.searchReplace(form.querySelector('input[type="search"]').value)
        }
    }

    document.body.append(sheet)
})

function addToDownloadQueue(object) {
    // Peek the sheet if not already visible
    document.querySelector('xyz-sheet').setAttribute('peek', true)
    document.querySelector('xyz-sheet').open()

    const pollCallback = createDownloadListItem(object)

    fetch('/api/download', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then(r => r.json()).then(json => {

        Object.assign(object, json)

        pollCallback(object)

        // Add the dl object to localStorage
        const s = JSON.parse(localStorage.getItem('yt-dl-queue') || '[]')
        s.unshift(object)
        localStorage.setItem('yt-dl-queue', JSON.stringify(s))
        
        if (json.error) { return }
    })

}

function pollUrl(object, callback) {
    if (object.started && !object.poll) {
        setTimeout(() => pollUrl(object, callback), 1000)
        return
    }
    let guardFinished = false
    return fetch(object.poll)
        .then(r => r.json())
        .then(progress => {
            if (progress.error || progress.errCode) {
                callback(progress)
                return Promise.reject(progress)
            } else {
                callback(null, progress)
                guardFinished = progress.finished
                return progress
            }
        })
        .then(() => {
            if (!guardFinished) {
                setTimeout(() => pollUrl(object, callback), 1000)
            }
        })
        .catch(json => callback(json))
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
    const txt = document.createElement('span')
    const xyzProg = document.createElement('xyz-progress')
    li.classList.add('dl-list-element')
    txt.textContent = `${object.id}: ${dict('dlSheet/states/starting')}`
    li.append(txt)
    li.append(xyzProg)
    ul.prepend(li)

    return () => pollUrl(object, function (err, json) {
        if (err) {
            console.error(err)
            return
        }
        console.log(json)

        if (json.finished) {
            txt.textContent = `
                ${object.id}: ${dict('dlSheet/states/done')}
            `
            const a = document.createElement('a')
            a.setAttribute('target', 'blank')
            a.href = json.url
            a.innerText = dict('dlSheet/dlLabel')
            txt.append(a)
            xyzProg.setAttribute('value', 1)
            return
        }


        if (json.merge) {
            xyzProg.setAttribute('value', json.merge.progress)

            txt.textContent = `
                ${object.id}: ${dict('dlSheet/states/converting')}
                ${dict('dlSheet/percentage', json.merge.progress)}
            `
            return
        }

        const progresses = [
            json[object.audioItag],
            json[object.videoItag]
        ].filter(x => !!x).map(p => p.progress)
        if (!progresses.length) { return }

        const progression = progresses.reduce((acc, v) => acc + v) / progresses.length

        txt.textContent = `${
            object.id
        }: ${
            dict('dlSheet/states/downloading')
        } ${
            dict('dlSheet/percentage', progression)
        }`

        xyzProg.setAttribute('value', progression)
    })
}

function makeFooter() {
    const d = document.createElement('div')
    const c = document.createElement('div')
    d.classList.add('with-love')
    c.classList.add('container')
    c.innerHTML = `
        <p>${dict('welcome/love')}</p>
        <p>${dict('welcome/don8')} • ${dict('welcome/source')}</p>
    `

    const s = document.createElement('select')
    s.setAttribute('aria-label', dict('welcome/languageA11yLabel'))
    c.append(s)
    s.classList.add('yt-select')
    // s.name = 'lang'
    yt.langs.forEach(lang => {
        const o = document.createElement('option')
        o.value = lang.full
        o.textContent = lang.name
        if (lang.full === yt.lang) {
            o.selected = true
        }
        s.append(o)
    })
    s.addEventListener('input', function () {
        let s = location.search
        s = s.replace(/(?:\?|\&)lang=[a-z\-_]+/gi, '')
        s += s ? '&' : '?'
        s += `lang=${this.value}`
        location.search = s
    })
    d.append(c)
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
    return what != null ? mod(what) : void 0;
}

/**
 * Retrieves a deep property without throwing if not deep enough
 * @param {*} what The object
 * @param {string[]} props The properties to look up
 * @returns {*} The retrieved property or undefined if not found
 * @author MindfulMinun
 * @since 2020-01-20
 * @version 1.0.0
 */
function safeLookup(what, props) {
    let currentProp;

    while (props.length) {
        if (what == null) { return void 0 }
        currentProp = props.shift()
        what = what[currentProp]
    }
    return what
}

function dict(what, ...params) {
    const path = what.split('/')
    let prop, dict = yt.dict
    while (prop = path.shift()) {
        dict = guard(dict, () => dict[prop]) || undefined
    }
    
    // If the property is undefined~ish, log a warning
    if (null == dict) {
        console.warn(`Error: Entrada del diccionario en "${what}" es nulo or no definido. En cambio se devolvió la ruta.`)
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
        let left = [],
            right = [],
            i = 0,
            j = this.length
        
        const out = [left, right]

        for (; i < j; i++){
            (f.call(this, this[i], i) ? left : right).push(this[i]);
        }

        return out
    }
}
