// ---------- 1. CLICK TO SWAP THE PICTURE ----------

// this function gets one image and makes it swap when clicked
function makeImageSwap(img) {
  let firstPicture = img.getAttribute("src");
  let secondPicture = img.dataset.alt;
  let showingSecond = false;

  function swapPicture() {
    if (showingSecond === false) {
      img.src = secondPicture;
      showingSecond = true;
    } else {
      img.src = firstPicture;
      showingSecond = false;
    }
  }

  img.addEventListener("click", swapPicture);
}

// find every image inside a panel that has the class "swap"
let swapImages = document.querySelectorAll(".swap img");

for (let i = 0; i < swapImages.length; i = i + 1) {
  makeImageSwap(swapImages[i]);
}


// ---------- 2. PICK AN ENDING ----------

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