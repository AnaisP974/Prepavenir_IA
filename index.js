const jourNuit = document.getElementById('jourNuit');
const body = document.getElementById('page');

jourNuit.addEventListener('click', () => {
    console.log("entrée")
    body.classList.toggle("darkMode");
})