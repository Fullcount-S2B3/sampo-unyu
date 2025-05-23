// js/modules/animations/pageHeaderTitleAnimation.js

export function initPageHeaderTitleAnimation() {
  const pageHeader = document.querySelector(".page-header");

  if (!pageHeader || document.body.classList.contains("page-top")) {
    return;
  }

  const pageHeaderTitle = pageHeader.querySelector(".page-header__title");
  const pageHeaderBg = pageHeader.querySelector(".page-header__bg");

  if (!pageHeaderTitle) {
    return;
  }

  const startAnimation = () => {
    requestAnimationFrame(() => {
      pageHeaderTitle.classList.add("is-visible");
    });
  };

  if (pageHeaderBg) {
    const computedStyle = window.getComputedStyle(pageHeaderBg);
    const bgImageStyle = computedStyle.backgroundImage;

    if (bgImageStyle && bgImageStyle !== "none" && bgImageStyle.trim() !== "") {
      const imageUrlMatch = bgImageStyle.match(
        /url\(\s*["']?([^"')]+)["']?\s*\)/i
      );

      if (imageUrlMatch && imageUrlMatch[1]) {
        const imageUrl = imageUrlMatch[1];
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
          console.log("Page header background image loaded:", imageUrl);
          startAnimation();
        };
        img.onerror = () => {
          console.warn(
            "Page header background image failed to load:",
            imageUrl,
            ". Starting animation anyway."
          );
          startAnimation();
        };
        return;
      } else {
        console.log(
          "No direct image URL found in page header background. Starting animation directly."
        );
        startAnimation();
      }
    } else {
      console.log(
        "Page header background image is not set. Starting animation directly."
      );
      startAnimation();
    }
  } else {
    console.log(
      ".page-header__bg element not found. Starting animation directly."
    );
    startAnimation();
  }
}
