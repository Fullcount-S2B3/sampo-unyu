import { hideLoading } from "../utils/loadingSpinner.js"; // loadingSpinnerをインポート

function setupH1Text(element) {
  if (!element) return [];
  const originalHTML = element.innerHTML;
  element.innerHTML = ""; // Clear existing content
  const fragment = document.createDocumentFragment();
  const charNodes = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = originalHTML; // Use innerHTML to parse HTML entities like <br>

  Array.from(tempDiv.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent || "";
      for (let i = 0; i < textContent.length; i++) {
        const char = textContent[i];
        const span = document.createElement("span");
        span.className = "char-span"; // Add class for styling
        if (char === " ") {
          span.innerHTML = "&nbsp;"; // Use &nbsp; for spaces to maintain layout
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
      const br = document.createElement("br"); // Re-create <br> tags
      fragment.appendChild(br);
      // Optionally, add a special marker or handle <br> in charNodes if needed for animation logic
    }
    // Other element nodes within H1 are ignored in this simple version
  });
  element.appendChild(fragment);
  return charNodes;
}

async function animateH1(h1CharSpans) {
  if (!h1CharSpans || h1CharSpans.length === 0) return;
  const charAnimationDelay = 150; // ms for stagger

  h1CharSpans.forEach((span, index) => {
    // Assuming CSS will handle the animation based on this variable and class
    span.style.setProperty("--char-index", index); // For stagger in CSS if preferred
    span.style.setProperty("--char-delay", `${index * charAnimationDelay}ms`);
    // Trigger animation by adding a class or directly setting styles for JS animation
    span.style.opacity = "1";
    span.style.transform = "translateY(0)";
  });

  // Calculate total animation time for H1 to resolve promise
  const charTransitionDuration = 500; // Duration of each char's transition
  const totalH1AnimationTime =
    (h1CharSpans.length > 0
      ? (h1CharSpans.length - 1) * charAnimationDelay
      : 0) + charTransitionDuration;
  return new Promise((resolve) => setTimeout(resolve, totalH1AnimationTime));
}

function fadeInP() {
  const pElement = document.querySelector(".hero__text p");
  if (pElement) {
    pElement.classList.add("is-visible");
  }
}

function startWaveAnimation() {
  const heroWave = document.querySelector(".hero__wave");
  if (heroWave) {
    heroWave.classList.add("is-active");
  }
}

function startHeroContentAnimationsSequence(h1CharSpans) {
  hideLoading(); // ヒーローアニメーション開始直前にローディングを非表示
  startWaveAnimation();
  // H1アニメーションの開始を少し遅らせる (波のアニメーションと同時または直後)
  setTimeout(() => {
    animateH1(h1CharSpans).then(() => {
      fadeInP(); // H1アニメーション完了後にP要素をフェードイン
    });
  }, 500); // この遅延はお好みで調整
}

export function initHeroAnimations() {
  const video = document.querySelector(".hero__video");
  const h1Element = document.querySelector(".hero__text h1");
  let h1CharSpans = [];

  if (h1Element) {
    h1CharSpans = setupH1Text(h1Element);
  }

  let windowLoaded = false;
  let videoReadyForAnimations = false;

  const tryStartAnimations = () => {
    if (windowLoaded && videoReadyForAnimations) {
      startHeroContentAnimationsSequence(h1CharSpans);
    }
  };

  window.addEventListener("load", () => {
    windowLoaded = true;
    tryStartAnimations();
  });

  if (video) {
    const onVideoReady = () => {
      if (!videoReadyForAnimations) {
        // Ensure it runs only once
        videoReadyForAnimations = true;
        tryStartAnimations();
      }
    };
    // Check if video is already ready
    if (video.readyState >= 3) {
      // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      onVideoReady();
    } else {
      video.addEventListener("canplaythrough", onVideoReady, { once: true });
      video.addEventListener("loadeddata", onVideoReady, { once: true }); // Fallback
    }
  } else {
    // No video element, consider "video ready" for animations
    console.warn(
      "Hero video element not found. Proceeding with animations based on window load."
    );
    videoReadyForAnimations = true;
    // If window is already loaded by the time this else block is reached
    if (document.readyState === "complete") {
      // or windowLoaded flag
      tryStartAnimations();
    }
  }
}
