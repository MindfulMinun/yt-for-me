const search = document.querySelector('input[type="text"]')
search.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        window.location.href = `/search?q=${encodeURIComponent(event.target.value)}`
    }
})
