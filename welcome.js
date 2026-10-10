// when the start button is pressed, fade the welcome page out
// and then go to the comic page

let startButton = document.getElementById("start-button");

function startReading(event) {
  // stop the link from jumping to the next page right away
  event.preventDefault();

  // this adds the fade-out class, which makes the page fade
  document.body.classList.add("fade-out");

  // wait 600 milliseconds for the fade, then change page
  setTimeout(goToComic, 600);
}

function goToComic() {
  window.location.href = "comic.html";
}

startButton.addEventListener("click", startReading);