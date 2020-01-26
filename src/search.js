(function () {
    'use strict'

    // fetch('/api/search?q=tokyo+night+flyght&1').then(r => r.json()).then(console.log)

    // Export the function to the global
    yt.views = yt.views || {}
    yt.views.searchInit = searchInit

    yt.views.searchReplace = function (query, wasReplaced) {
        document.getElementById('view').classList.add('anim--fuck-this-shit-im-out')
        yt.views.searchInit(query, wasReplaced)
    }

    // Called when a search request is made.
    function searchInit(query, wasReplaced) {
        const searchParams = new URLSearchParams(location.search)
        if (query) {
            searchParams.set('q', query)
        }
        query = searchParams.get('q') || ''

        if (!wasReplaced) {
            history.pushState({
                qi: yt.qi(),
                view: 'search',
                params: searchParams.toString(),
                id: null
            }, dict('search/searchTitle', query), `/search?${searchParams}`)
        }

        searchParams.set('page',
            +searchParams.get('page') + 1
        )

        const view = document.getElementById('view')

        if (!query || query.trim() === '') {
            view.classList.add('search--empty-state')
            view.classList.remove('anim--fuck-this-shit-im-out')
            view.innerHTML = `
                <p class="fade-in-out">${dict('search/emptySearch')}</p>
            `
            return
        }
        
        view.insertAdjacentHTML('afterbegin', `
            <p class="loading">${
                dict('search/loading', query || '...')
            }</p>
        `)

        fetch(`/api/search?${searchParams}`)
            .then(r => r.json())
            .then(yt.rejectOnFetchErr)
            .then(results => {
                document.title = dict('search/searchTitle', results.query)
                view.innerHTML = `
                    <p class="fade-out">${
                        dict('search/resultsFor', results.query)
                    }</p>
                `

                const searchUl = document.createElement('ul')
                searchUl.classList.add('a11y-list', 'search-list', 'mobile-edge-flush')
                view.classList.remove('anim--fuck-this-shit-im-out')

                _appendToUl(results, searchUl)
                view.appendChild(searchUl) 
                

                const wrapper = document.createElement('div')
                wrapper.classList.add('center')
                const loadMore = document.createElement('button')
                loadMore.classList.add('yt-btn', 'yt-btn--large')
                loadMore.innerText = 'Cargar más resultados'

                loadMore.addEventListener('click', event => {
                    // Disable the button while the search is being performed
                    loadMore.setAttribute('disabled', 'disabled')

                    // Load the results and disable the button again
                    _loadMore(searchUl, searchParams)
                        .then(() => {
                            loadMore.removeAttribute('disabled')
                        })
                })

                wrapper.appendChild(loadMore)
                view.appendChild(wrapper)
            })
            .catch(err => {
                view.innerHTML = dict('errors/searchErr', err)
            })
    }

    function _loadMore(ul, searchParams) {
        // Increase the page number
        searchParams.set('page',
            +searchParams.get('page') + 1
        )

        // Search and add the results to the ul
        return fetch(`/api/search?${searchParams}`)
            .then(r => r.json())
            .then(yt.rejectOnFetchErr)
            .then(results => _appendToUl(results, ul))
    }

    function _appendToUl(results, searchUl) {
        results.vids.forEach((vid, i) => {
            const li = document.createElement('li')
            li.classList.add('search-li')
            li.style.setProperty('--anim-stagger', i)
            const a = document.createElement('a')
            li.appendChild(a)
            a.classList.add('search-card')
            a.href = `/${vid.videoId}${location.search}`
            a.dataset.id = vid.videoId

            a.onclick = event => {
                if (yt.views && yt.views.videoReplace) {
                    event.preventDefault()
                    yt.views.videoReplace(a.dataset.id)
                }
            }

            a.setAttribute('title', vid.title)
            a.setAttribute('aria-label', vid.title)


            a.innerHTML = `
                <div class="search-card-content">
                    <span class="search-card-entry">${vid.title}</span>
                    <span class="search-card-entry">
                        ${dict('search/by', vid.author.name)} •
                        ${dict('search/views', vid.views)}
                    </span>
                    <span class="search-card-entry">
                        ${dict('search/relTime', vid.ago)}
                    </span>
                </div>
                <div class="search-card-cover" style="background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url('${vid.thumb}');" aria-hidden>
                    <span class="search-card-duration">${vid.duration.timestamp}</span>
                </div>
            `
            
            searchUl.appendChild(li)
        })
    }

})()
