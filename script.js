// SHARED: AUTO-SCROLL TO THE NEXT PAGE

// once a reader is done with a page (the story finishes, a choice gets
// picked, the flood plays out), wait a couple of seconds and smooth-scroll
// down to whichever ".page" section comes right after it - skips over
// anything in between (like the footer) that isn't itself a ".page"
function autoScrollToNextPage(currentPage, delay) {
  if (!currentPage) {
    return;
  }

  // used this documentation to learn about Element.nextElementSibling: https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
  // it walks forward through the HTML one element at a time, which is how we
  // find the very next ".page" even if something non-".page" sits in between
  let next = currentPage.nextElementSibling;
  while (next && !next.classList.contains("page")) {
    next = next.nextElementSibling;
  }

  if (next) {
    setTimeout(function () {
      // used this documentation to learn about Element.scrollIntoView and its options object: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      // "block: center" matters here - with no options scrollIntoView
      // defaults to aligning the section's top edge to the viewport's
      // top edge, which (with the margin above each .page) scrolls
      // further than it needs to. centering it stops short of that.
      next.scrollIntoView({ behavior: "smooth", block: "center" });
    }, delay);
  }
}


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
        // used this documentation to learn about Element.closest: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        // "stage" is the figure inside the page's section, not the section itself -
        // closest(".page") walks back up the HTML to find that wrapping section
        // no step after this one means the story is over
        if (!steps[index + 1]) {
          autoScrollToNextPage(stage.closest(".page"), 2000);
        }
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
        // no step after this one means the story is over
        if (!steps[index + 1]) {
          autoScrollToNextPage(stage.closest(".page"), 2000);
        }
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


// 2. PAGE 2: PANEL 1 FADES INTO THE TWO CHOICES

// which choice the reader picked here, "A" or "B" - page 5 at the end reads
// this to decide which pair of ending panels to play. starts out null since
// nothing's been picked yet; page 5 falls back to "A" if it's ever reached
// without this being set
let storyPath = null;

// panel 1 starts covering the whole area. clicking it fades it out and
// fades the two choice panels in, in the same spot. which pathway the
// reader picks comes later - for now this just handles the transition
// between panel 1 and the choices (hover highlight + caption on each
// choice is handled by styles.css alone, no JS needed for that part)
let owlPanel = document.getElementById("owl-panel");
let choiceRow = document.getElementById("choice-row");
let choiceA = document.getElementById("choice-a");
let choiceB = document.getElementById("choice-b");

if (owlPanel && choiceRow) {
  owlPanel.addEventListener("click", function () {
    owlPanel.classList.add("faded");
    choiceRow.classList.add("visible");
  });
}

// picking a choice records which path it was (for page 5, later) and is "done" 
// with page 2 which is what triggers the auto-scroll on to the next page
if (choiceA && choiceB) {
  function handleChoicePicked(path) {
    storyPath = path;
    autoScrollToNextPage(choiceA.closest(".page"), 2000);
  }

  choiceA.addEventListener("click", function () {
    handleChoicePicked("A");
  });
  choiceB.addEventListener("click", function () {
    handleChoicePicked("B");
  });
}


// 3. CLICK TO SWAP THE PICTURE

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


// 4. PICK AN ENDING

// used this documentation to learn more about the classList property: https://mangohost.net/blog/javascript-classlist-how-to-manipulate-classes-easily/

// guarded since button-a/button-b/end-a/end-b aren't in the page right now
// the two choice panels in section 2 replace them for now and the real logic will come later
let buttonA = document.getElementById("button-a");
let buttonB = document.getElementById("button-b");
let endingA = document.getElementById("end-a");
let endingB = document.getElementById("end-b");

if (buttonA && buttonB) {
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
}


// 5. PAGE 3: PANEL 1 ZOOMS INTO PANEL 2, THEN CROSSFADES INTO PANEL 3

// same two-layer crossfade setup as page 1's stage, reusing the same
// .stage/.stage-layer CSS - but only two clicks here and no captions.
// the first click (panel 1 -> panel 2) gets a "zoom" transition instead of
// the plain fade the second click (panel 2 -> panel 3) uses
let page3Stage = document.getElementById("page3-stage");

if (page3Stage) {
  let page3LayerA = document.getElementById("page3-img-a");
  let page3LayerB = document.getElementById("page3-img-b");
  let page3ActiveLayer = page3LayerA;
  let page3InactiveLayer = page3LayerB;

  let page3StepIndex = 0;
  let page3Steps = [
    { img: "assets/page3_panel1.png" },
    { img: "assets/page3_panel2.png", transition: "zoom" },
    { img: "assets/page3_panel3.png", transition: "fade" }
  ];

  page3Stage.classList.add("clickable");

  // same crossfade-by-swapping-layers idea as swapImage() in section 1
  function page3SwapImage(src) {
    page3InactiveLayer.src = src;
    page3ActiveLayer.classList.remove("active");
    page3InactiveLayer.classList.add("active");
    let temp = page3ActiveLayer;
    page3ActiveLayer = page3InactiveLayer;
    page3InactiveLayer = temp;
  }

  page3Stage.addEventListener("click", function () {
    let next = page3Steps[page3StepIndex + 1];
    if (!next) {
      return;
    }

    if (next.transition === "zoom") {
      // scales the current (outgoing) picture up while page3SwapImage fades
      // it out, instead of the plain crossfade the other transition uses
      page3ActiveLayer.classList.add("zoom-out");
    }

    page3SwapImage(next.img);
    page3StepIndex = page3StepIndex + 1;

    // page3SwapImage already swapped the layer references above, so
    // page3InactiveLayer now points at the picture that just zoomed out -
    // clean its zoom-out class off once the transition is done
    setTimeout(function () {
      page3InactiveLayer.classList.remove("zoom-out");
    }, 800);

    // no step after this one means page 3 is done
    if (!page3Steps[page3StepIndex + 1]) {
      page3Stage.classList.remove("clickable");
      autoScrollToNextPage(page3Stage.closest(".page"), 2000);
    }
  });
}


// FLOOD ANIMATION: click the image and it flips through the three images by itself
// used this to debug preloading images: https://stackoverflow.com/questions/3646036/preloading-images-with-javascript
// read more about clearInterval here: https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval
// read more about setInterval here: https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval


let floodImg = document.getElementById("flood-img");
let floodPictures = ["assets/flood1.jpg", "assets/flood2.jpg", "assets/flood3.jpg", "assets/flood4.jpg"];
let floodNumber = 0;
let floodTimer = null;

// load all three images right away so there is
// no blank black screen when they are changing
for (let i = 0; i < floodPictures.length; i = i + 1) {
  let preload = new Image();
  preload.src = floodPictures[i];
}

// show the next image, and stop after the last one
function nextFloodPicture() {
  floodNumber = floodNumber + 1;
  floodImg.src = floodPictures[floodNumber];

  if (floodNumber === floodPictures.length - 1) {
    clearInterval(floodTimer);
    // the flood has played all the way through - this is the last page so scroll
    autoScrollToNextPage(floodImg.closest(".page"), 2000);
  }
}

// start flipping every 700 milliseconds (only if it hasn't started already)
function startFlood() {
  if (floodTimer === null) {
    floodTimer = setInterval(nextFloodPicture, 700);
  }
}

floodImg.addEventListener("click", startFlood);


// 6. PAGE 5: THE ENDING

// one click on panel 1 starts it - from there panel 2, then 3A/4A or 3B/4B
// (whichever pair storyPath, set back on page 2, points to) play through
// on their own, one after another, with no more clicks needed
let page5Stage = document.getElementById("page5-stage");

if (page5Stage) {
  let page5LayerA = document.getElementById("page5-img-a");
  let page5LayerB = document.getElementById("page5-img-b");
  let page5ActiveLayer = page5LayerA;
  let page5InactiveLayer = page5LayerB;
  let page5StepIndex = 0;
  let page5Steps = null;
  let page5Started = false;

  // same crossfade-by-swapping-layers idea as swapImage() in section 1
  function page5SwapImage(src) {
    page5InactiveLayer.src = src;
    page5ActiveLayer.classList.remove("active");
    page5InactiveLayer.classList.add("active");
    let temp = page5ActiveLayer;
    page5ActiveLayer = page5InactiveLayer;
    page5InactiveLayer = temp;
  }

  // after the first click, every later step schedules the next one itself,
  // the same delay-then-advance as the "auto" steps in section 1
  function page5PlayNext() {
    let next = page5Steps[page5StepIndex + 1];
    if (!next) {
      // page 5 is the ending - nothing comes after it right now, but this
      // keeps it consistent with the other pages for whenever one is added
      autoScrollToNextPage(page5Stage.closest(".page"), 2000);
      return;
    }

    setTimeout(function () {
      page5SwapImage(next.img);
      page5StepIndex = page5StepIndex + 1;
      page5PlayNext();
    }, next.delay);
  }

  // builds the step list and kicks off playback - called from the click
  // below, so storyPath already reflects whichever choice was picked on
  // page 2, and the delays are timed from the click
  function page5Start() {
    if (page5Started) {
      return;
    }
    page5Started = true;
    page5Stage.classList.remove("clickable");

    // used this documentation to learn about the conditional (ternary) operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
    // shorthand for an if/else that only picks a value - "A" is the fallback
    // if this page is ever reached without storyPath having been set
    let page5Path = storyPath === "B" ? "B" : "A";

    page5Steps = [
      { img: "assets/page5_panel1.png" },
      { img: "assets/page5_panel2.png", delay: 1200 },
      { img: "assets/page5_panel3" + page5Path + ".png", delay: 1800 },
      { img: "assets/page5_panel4" + page5Path + ".png", delay: 1800 }
    ];

    page5PlayNext();
  }

  page5Stage.classList.add("clickable");
  page5Stage.addEventListener("click", page5Start);
}
