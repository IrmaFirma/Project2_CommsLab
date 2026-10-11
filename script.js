// 1. PAGE 1: CLICK-THROUGH STORY SEQUENCE

// the stage shows one picture at a time. "steps" lists in order every picture 
// the stage will show, what line of narration (if any) goes with it, how we 
// move on to it (a click, or just waiting a bit), and what kind of transition 
// plays on the way in ("smoke" for the placeholder purple circles, "fade" for 
// a plain crossfade).
let stage = document.getElementById("story-stage");

if (stage) {

  let layerA = document.getElementById("stage-img-a");
  let layerB = document.getElementById("stage-img-b");
  let activeLayer = layerA;
  let inactiveLayer = layerB;

  let smoke = document.getElementById("smoke-overlay");

  // the opening line shows over the smoke itself
  let smokeCaptionBox = document.getElementById("smoke-caption");
  let smokeCaptionText = document.getElementById("smoke-caption-text");

  // every line after that uses the figcaption.it stays empty until a step/panel with a line sets it
  let captionBox = document.getElementById("stage-caption");
  captionBox.textContent = "";

  let currentStepIndex = 0;
  let isTransitioning = false;
  let currentCaption = "";
  let currentSide = null;

  // "side" is which corner the figcaption sits in for that line: "left" is
  // the default (same as the rest of the site), "right" moves it over
  let steps = [
    { img: "assets/page1_panel1.png" },
    { img: "assets/page1_panel2.png", caption: "If you wish to marry into my dynasty, modern boy, you must prove your worth", transition: "smoke", trigger: "click" },
    { img: "assets/page1_panel3.png", caption: "Bring me the Golden Desert Owl", side: "left", transition: "fade", trigger: "auto", delay: 1800 },
    { img: "assets/page1_panel4.png", caption: "Consider it done", side: "right", transition: "fade", trigger: "click" },
    { img: "assets/page1_panel5.png", caption: "And if you fail...", side: "left", transition: "fade", trigger: "click" },
    { img: "assets/page1_panel6.png", caption: "And if you fail...", side: "left", transition: "fade", trigger: "auto", delay: 1500 }
  ];

  // only show the pointer cursor when the next step is waiting on a click
  function updateClickability() {
    let next = steps[currentStepIndex + 1];
    if (!isTransitioning && next && next.trigger === "click") {
      stage.classList.add("clickable");
    } else {
      stage.classList.remove("clickable");
    }
  }

  // "has-caption" lets figcaption be revealed by hovering, but only for a panel that actually 
  // has a line.
  // TEMPORARY: "show-caption" reveals it automatically so the reader doesn't have to hover to 
  // follow the story.
  // If the new line is the same as what's already showing,leave it alone instead of flashing 
  // it out and back in
  function showCaption(text, side) {
    if (text === currentCaption) {
      return;
    }

    // when the line is moving to the other corner, send the current one back down first and 
    // bring the new one up afterwards, instead of jumping straight across
    let wasShowing = currentCaption && side !== currentSide;

    function applyLine() {
      currentCaption = text;
      currentSide = side;

      if (!text) {
        stage.classList.remove("has-caption");
        stage.classList.remove("show-caption");
        captionBox.textContent = "";
        return;
      }

      captionBox.textContent = text;
      // used this documentation to learn about the second (force) argument of classList.toggle: https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
      // passing true/false forces the class on/off instead of just flipping it
      captionBox.classList.toggle("caption-right", side === "right");
      stage.classList.add("has-caption");
      stage.classList.add("show-caption");
    }

    if (wasShowing) {
      // "switching-side" forces it down even if the mouse is still hovering otherwise hovering
      // would just hold it up the whole time and the dip wouldn't show
      stage.classList.remove("show-caption");
      stage.classList.add("switching-side");
      setTimeout(function () {
        stage.classList.remove("switching-side");
        applyLine();
      }, 300);
    } else {
      applyLine();
    }
  }

  // the opening line, shown and hidden separately since it sits over the smoke rather than in the figcaption
  function showSmokeCaption(text) {
    smokeCaptionText.textContent = text;
    smokeCaptionBox.classList.add("visible");
  }

  function hideSmokeCaption() {
    smokeCaptionBox.classList.remove("visible");
  }

  // crossfades to a new picture by loading it into the hidden layer, then swapping which layer is "active"
  function swapImage(src) {
    inactiveLayer.src = src;
    activeLayer.classList.remove("active");
    inactiveLayer.classList.add("active");
    let temp = activeLayer;
    activeLayer = inactiveLayer;
    inactiveLayer = temp;
  }

  // used this documentation to learn about the setTimeout function: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
  // it waits a given number of milliseconds, then runs the function once

  // if the step after this one happens automatically, queue it up
  function scheduleNext() {
    let next = steps[currentStepIndex + 1];
    if (next && next.trigger === "auto") {
      setTimeout(function () {
        goToStep(currentStepIndex + 1);
      }, next.delay);
    }
  }

  function goToStep(index) {
    let step = steps[index];
    isTransitioning = true;
    updateClickability();

    if (step.transition === "smoke") {
      // bring the smoke in
      smoke.classList.add("active");
      setTimeout(function () {
        smoke.classList.add("cover");
      }, 50);

      // once it fully covers the stage, swap the picture and show the line
      setTimeout(function () {
        swapImage(step.img);
        showSmokeCaption(step.caption);
      }, 750);

      // hold so the line has time to be read, then let the smoke part and take the line with it
      setTimeout(function () {
        hideSmokeCaption();
        smoke.classList.remove("cover");
      }, 4200);

      setTimeout(function () {
        smoke.classList.remove("active");
        currentStepIndex = index;
        isTransitioning = false;
        updateClickability();
        scheduleNext();
      }, 4900);

    } else {
      // plain crossfade
      swapImage(step.img);

      setTimeout(function () {
        showCaption(step.caption, step.side);
      }, 400);

      setTimeout(function () {
        currentStepIndex = index;
        isTransitioning = false;
        updateClickability();
        scheduleNext();
      }, 800);
    }
  }

  stage.addEventListener("click", function () {
    let next = steps[currentStepIndex + 1];
    if (!isTransitioning && next && next.trigger === "click") {
      goToStep(currentStepIndex + 1);
    }
  });

  updateClickability();
}


// 2. CLICK TO SWAP THE PICTURE

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


// 3. PICK AN ENDING

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
