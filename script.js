(function () {
  "use strict";

  var TOTAL_PAGES = 48;
  var PAGE_WIDTH = 1282;
  var PAGE_HEIGHT = 1819;

  var pages = [];
  for (var i = 1; i <= TOTAL_PAGES; i++) {
    var n = i < 10 ? "0" + i : String(i);
    pages.push("images/page-" + n + ".png");
  }

  var bookEl = document.getElementById("book");
  var loadingEl = document.getElementById("loading");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var indicatorEl = document.getElementById("page-indicator");

  var baseWidth = Math.round(PAGE_WIDTH / 2.4);
  var baseHeight = Math.round(PAGE_HEIGHT / 2.4);

  var pageFlip = new St.PageFlip(bookEl, {
    width: baseWidth,
    height: baseHeight,
    size: "stretch",
    minWidth: 220,
    maxWidth: PAGE_WIDTH,
    minHeight: 300,
    maxHeight: PAGE_HEIGHT,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    autoSize: true,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 20,
    flippingTime: 700,
    drawShadow: true
  });

  pageFlip.loadFromImages(pages);

  function updateIndicator() {
    var current = pageFlip.getCurrentPageIndex() + 1;
    indicatorEl.textContent = current + " / " + TOTAL_PAGES;
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= TOTAL_PAGES;
  }

  pageFlip.on("init", function () {
    updateIndicator();
    loadingEl.classList.add("hidden");
  });

  pageFlip.on("flip", updateIndicator);
  pageFlip.on("changeState", updateIndicator);

  prevBtn.addEventListener("click", function () {
    pageFlip.flipPrev();
  });

  nextBtn.addEventListener("click", function () {
    pageFlip.flipNext();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      pageFlip.flipNext();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      pageFlip.flipPrev();
    } else if (e.key === "Home") {
      pageFlip.turnToPage(0);
    } else if (e.key === "End") {
      pageFlip.turnToPage(TOTAL_PAGES - 1);
    }
  });
})();
