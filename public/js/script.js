document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});


const hamburgerMenu = document.querySelector(".hb");
const navMenu = document.querySelector(".nav2");
const chm = document.querySelector(".fm");

hamburgerMenu.addEventListener("click", function() {
  
  
  if (window.innerWidth <= 700) {
    navMenu.style.display = "flex";
  }
});
chm.addEventListener("click", function() { 
  // if (window.innerWidth <= 700) {
    navMenu.style.display = "none";
  // }
});



