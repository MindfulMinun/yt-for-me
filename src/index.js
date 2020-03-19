// index.js
const rand = document.querySelectorAll('[data-random]')

rand.forEach(el => el.href = '/playlist?list=PLIm1cC9KsS_0AvI3B30PikS7A2k_puXTr&' + location.search.slice(1))

document.body.appendChild(makeFooter())
