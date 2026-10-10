// 1. CLICK TO SWAP THE PICTURE

// each swap panel has two pictures inside it, the second one starts hidden
// this function makes a panel switch which picture is hidden when it is clicked
function makePanelSwap(panel) {
  let pictures = panel.querySelectorAll("img");

  function swapPicture() {
    for (let i = 0; i < pictures.length; i = i + 1) {
      pictures[i].classList.toggle("hidden");
    }
  }

  panel.addEventListener("click", swapPicture);
}

// find every panel that has the class "swap"
let swapPanels = document.querySelectorAll(".swap");

for (let i = 0; i < swapPanels.length; i = i + 1) {
  makePanelSwap(swapPanels[i]);
}


// 2. PICK AN ENDING

// used this documentation to learn more about the classList property: https://mangohost.net/blog/javascript-classlist-how-to-manipulate-classes-easily/

let buttonA = document.getElementById("button-a");
let buttonB = document.getElementById("button-b");
let endingA = document.getElementById("end-a");
let endingB = document.getElementById("end-b");

function showEndingA() {
  endingA.classList.remove("hidden");
  endingB.classList.add("hidden");
}

function showEndingB() {
  endingB.classList.remove("hidden");
  endingA.classList.add("hidden");
}

buttonA.addEventListener("click", showEndingA);
buttonB.addEventListener("click", showEndingB);