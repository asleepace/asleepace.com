setInterval(function() {
   const elem = document.getElementById('timer')
   const date = new Date()
   elem.innerHTML = date.toLocaleTimeString()
}, 1000)