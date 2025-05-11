document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".hero__video");
  const heroWave = document.querySelector(".hero__wave");
  const h1Element = document.querySelector(".hero__text h1");
  const pElement = document.querySelector(".hero__text p");

  // h1のテキストを1文字ずつspanで囲む（<br>も保持）
  function setupH1Text(element) {
    if (!element) return [];
    // JSONから読み込まれたHTML文字列（<br>を含む）がelement.innerHTMLに入っていると想定
    const originalHTML = element.innerHTML;
    element.innerHTML = ""; // 一旦クリア
    const fragment = document.createDocumentFragment();
    let charNodes = []; // アニメーション対象となる文字のspan要素を格納

    // HTML文字列を一時的なdivに入れてDOMノードとしてアクセス可能にする
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalHTML;

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // テキストノードの場合
        const textContent = node.textContent || "";
        for (let i = 0; i < textContent.length; i++) {
          const char = textContent[i];
          const span = document.createElement("span");
          span.className = "char-span"; // スタイル適用のためクラス名を付与

          if (char === " ") {
            // 半角スペースの場合は &nbsp; をinnerHTMLで設定
            span.innerHTML = "&nbsp;";
          } else {
            // その他の文字はtextContentで設定
            span.textContent = char;
          }
          fragment.appendChild(span);
          charNodes.push(span);
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName.toLowerCase() === "br"
      ) {
        // <br> タグの場合はそのまま<br>タグとして追加
        const br = document.createElement("br");
        fragment.appendChild(br);
        // charNodesには含めない（<br>はアニメーション対象の「文字」ではないため）
      }
    });
    element.appendChild(fragment);
    return charNodes;
  }

  const h1CharSpans = setupH1Text(h1Element);

  async function animateH1() {
    if (h1CharSpans.length === 0) return;
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

  // pテキストをフェードイン
  function fadeInP() {
    if (pElement) {
      pElement.classList.add("is-visible");
    }
  }

  // SVGワイプアニメーションを開始
  function startWaveAnimation() {
    if (heroWave) {
      heroWave.classList.add("is-active");
    }
  }

  // アニメーション全体のシーケンスを開始する関数
  function startAnimations() {
    startWaveAnimation();

    setTimeout(() => {
      animateH1().then(() => {
        fadeInP();
      });
    }, 500);
  }

  // 動画の読み込みを監視
  if (video) {
    if (video.readyState >= 3) {
      startAnimations();
    } else {
      video.addEventListener("canplaythrough", startAnimations, { once: true });
      video.addEventListener("loadeddata", startAnimations, { once: true });
    }
  } else {
    console.warn(
      "Hero video element not found. Starting animations immediately."
    );
    startAnimations();
  }
});
