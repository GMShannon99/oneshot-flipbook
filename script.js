(function () {
  "use strict";

  var TOTAL_PAGES = 66;
  var PAGE_WIDTH = 1282;
  var PAGE_HEIGHT = 1819;
  var PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;
  var PORTRAIT_BREAKPOINT = 700;

  var pages = [];
  for (var i = 1; i <= TOTAL_PAGES; i++) {
    var n = i < 10 ? "0" + i : String(i);
    pages.push("images/page-" + n + ".png");
  }

  var stageEl = document.getElementById("stage");
  var loadingEl = document.getElementById("loading");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");
  var indicatorEl = document.getElementById("page-indicator");

  var pageFlip = null;
  var lastLayout = null;
  var resizeTimer = null;

  // Compute the largest book box that fits inside #stage's available
  // space without exceeding it in either dimension, while preserving
  // the page images' true aspect ratio (so nothing gets cropped).
  function computeLayout() {
    var cs = getComputedStyle(stageEl);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var availW = Math.max(stageEl.clientWidth - padX, 50);
    var availH = Math.max(stageEl.clientHeight - padY, 50);

    var usePortrait = window.innerWidth < PORTRAIT_BREAKPOINT;
    var spreadRatio = usePortrait ? PAGE_RATIO : PAGE_RATIO * 2;

    var totalW, totalH;
    if (availW / availH > spreadRatio) {
      totalH = availH;
      totalW = totalH * spreadRatio;
    } else {
      totalW = availW;
      totalH = totalW / spreadRatio;
    }

    var pageWidth = usePortrait ? totalW : totalW / 2;

    return {
      usePortrait: usePortrait,
      pageWidth: Math.max(180, Math.round(pageWidth)),
      pageHeight: Math.max(256, Math.round(totalH)),
      totalWidth: Math.round(totalW),
      totalHeight: Math.round(totalH)
    };
  }

  function updateIndicator() {
    if (!pageFlip) return;
    var current = pageFlip.getCurrentPageIndex() + 1;
    indicatorEl.textContent = current + " / " + TOTAL_PAGES;
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= TOTAL_PAGES;
  }

  function mount(layout, restoreIndex) {
    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (e) {
        /* ignore */
      }
      pageFlip = null;
    }

    var oldBook = document.getElementById("book");
    if (oldBook && oldBook.parentNode) {
      oldBook.parentNode.removeChild(oldBook);
    }

    var bookEl = document.createElement("div");
    bookEl.id = "book";
    // Explicit pixel size drives the container directly, so it never
    // depends on StPageFlip's own width-only responsive CSS (which can
    // produce a box taller than the viewport and get clipped).
    bookEl.style.width = layout.totalWidth + "px";
    bookEl.style.height = layout.totalHeight + "px";
    stageEl.insertBefore(bookEl, prevBtn);

    pageFlip = new St.PageFlip(bookEl, {
      width: layout.pageWidth,
      height: layout.pageHeight,
      size: "fixed",
      minWidth: layout.pageWidth,
      maxWidth: layout.pageWidth,
      minHeight: layout.pageHeight,
      maxHeight: layout.pageHeight,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: layout.usePortrait,
      autoSize: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 20,
      flippingTime: 700,
      drawShadow: true
    });

    pageFlip.loadFromImages(pages);

    pageFlip.on("init", function () {
      if (restoreIndex > 0) {
        pageFlip.turnToPage(restoreIndex);
      }
      updateIndicator();
      loadingEl.classList.add("hidden");
    });

    pageFlip.on("flip", updateIndicator);
    pageFlip.on("changeState", updateIndicator);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var layout = computeLayout();
      if (
        lastLayout &&
        lastLayout.pageWidth === layout.pageWidth &&
        lastLayout.pageHeight === layout.pageHeight &&
        lastLayout.usePortrait === layout.usePortrait
      ) {
        return;
      }
      lastLayout = layout;
      var idx = pageFlip ? pageFlip.getCurrentPageIndex() : 0;
      mount(layout, idx);
    }, 150);
  }

  lastLayout = computeLayout();
  mount(lastLayout, 0);

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  prevBtn.addEventListener("click", function () {
    if (pageFlip) pageFlip.flipPrev();
  });

  nextBtn.addEventListener("click", function () {
    if (pageFlip) pageFlip.flipNext();
  });

  document.addEventListener("keydown", function (e) {
    if (!pageFlip) return;
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
