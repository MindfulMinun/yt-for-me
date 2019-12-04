// index.js
const rand = document.querySelectorAll('[data-random]')
const form = document.querySelector('form')

const vids = [
    'ckRSn2zWt_o', // Shyness Boy
    'VgUR1pna5cY', // Natural
    '1iKZhsc8WGs', // Moe Shop - Charm
    '0E5l2GHBxB8', // Stal
    'dQw4w9WgXcQ'  // get rickrolled lol
]

rand.forEach(el => el.href = choose(vids))

form.appendChild(makeFooter())
