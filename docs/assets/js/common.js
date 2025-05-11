const loadingSpinner = document.querySelector(".loading-spinner");

function showLoading() {
  if (loadingSpinner) {
    loadingSpinner.classList.remove("is-hidden");
    loadingSpinner.classList.add("is-loading");
  }
}

function hideLoading() {
  if (loadingSpinner) {
    loadingSpinner.classList.remove("is-loading");
    loadingSpinner.classList.add("is-hidden");
  }
}

showLoading();

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".hero__video");
  const heroWave = document.querySelector(".hero__wave");
  const h1Element = document.querySelector(".hero__text h1");
  const pElement = document.querySelector(".hero__text p");

  let h1CharSpans = [];

  function setupH1Text(element) {
    if (!element) return [];
    const originalHTML = element.innerHTML;
    element.innerHTML = "";
    const fragment = document.createDocumentFragment();
    let charNodes = [];
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalHTML;

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || "";
        for (let i = 0; i < textContent.length; i++) {
          const char = textContent[i];
          const span = document.createElement("span");
          span.className = "char-span";
          if (char === " ") {
            span.innerHTML = "&nbsp;";
          } else {
            span.textContent = char;
          }
          fragment.appendChild(span);
          charNodes.push(span);
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName.toLowerCase() === "br"
      ) {
        const br = document.createElement("br");
        fragment.appendChild(br);
      }
    });
    element.appendChild(fragment);
    return charNodes;
  }

  if (h1Element) {
    h1CharSpans = setupH1Text(h1Element);
  }

  async function animateH1() {
    if (!h1CharSpans || h1CharSpans.length === 0) return;
    const charAnimationDelay = 150;

    h1CharSpans.forEach((span, index) => {
      span.style.setProperty("--char-delay", `${index * charAnimationDelay}ms`);
      span.style.opacity = "1";
      span.style.transform = "translateY(0)";
    });

    const charTransitionDuration = 500;
    const totalH1AnimationTime =
      (h1CharSpans.length > 0
        ? (h1CharSpans.length - 1) * charAnimationDelay
        : 0) + charTransitionDuration;

    return new Promise((resolve) => setTimeout(resolve, totalH1AnimationTime));
  }

  function fadeInP() {
    if (pElement) {
      pElement.classList.add("is-visible");
    }
  }

  function startWaveAnimation() {
    if (heroWave) {
      heroWave.classList.add("is-active");
    }
  }

  function startHeroContentAnimations() {
    hideLoading(); // ヒーローアニメーション開始直前にローディングを非表示
    startWaveAnimation();
    setTimeout(() => {
      animateH1().then(() => {
        fadeInP();
      });
    }, 500);
  }

  let windowLoaded = false;
  let videoReadyForAnimations = false;

  function tryStartAnimations() {
    if (windowLoaded && videoReadyForAnimations) {
      startHeroContentAnimations();
    }
  }

  window.addEventListener("load", () => {
    windowLoaded = true;
    tryStartAnimations();
  });

  if (video) {
    const onVideoReady = () => {
      if (!videoReadyForAnimations) {
        // 複数回発火する可能性のあるイベントのためフラグチェック
        videoReadyForAnimations = true;
        tryStartAnimations();
      }
    };

    if (video.readyState >= 3) {
      // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      // video.play().catch(() => {}); // autoplay属性がある場合は不要なことも多いが、念のため
      onVideoReady();
    } else {
      video.addEventListener("canplaythrough", onVideoReady, { once: true });
      video.addEventListener("loadeddata", onVideoReady, { once: true }); // loadeddataはcanplaythroughより先に発火する可能性がある
    }
  } else {
    console.warn(
      "Hero video element not found. Assuming video is ready for animations."
    );
    videoReadyForAnimations = true;
    tryStartAnimations(); // window.onloadを待つことになる
  }
});
