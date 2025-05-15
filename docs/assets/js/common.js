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

///ナビゲーション開閉
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.header__menu-toggle');
  const globalNavMenu = document.getElementById('global-nav-menu');
  const body = document.body;

  if (menuToggle && globalNavMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isOpen);
      globalNavMenu.classList.toggle('is-open');
      body.classList.toggle('nav-open');

      // メニューアイコンのテキストを変更する場合 (例: anchor と close)
      const menuIcon = this.querySelector('.header__menu-icon');
      if (menuIcon) {
        if (!isOpen) {
          // メニューを開いた時、「閉じる」アイコンに変更
          menuIcon.textContent = 'close'; // Material Icons の 'close' アイコン
          // menuIcon.classList.remove('material-icons-outlined'); // 必要に応じてクラス調整
          // menuIcon.classList.add('material-icons'); // filled な close を使う場合など
        } else {
          // メニューを閉じた時、「アンカー」アイコンに戻す
          menuIcon.textContent = 'anchor';
          // menuIcon.classList.add('material-icons-outlined');
        }
      }
    });
  }

  // --- (オプション) メニュー外クリックで閉じる ---
  // document.addEventListener('click', function(event) {
  //   const isClickInsideMenu = globalNavMenu.contains(event.target);
  //   const isClickOnToggleButton = menuToggle.contains(event.target);
  //   const isMenuOpen = globalNavMenu.classList.contains('is-open');

  //   if (!isClickInsideMenu && !isClickOnToggleButton && isMenuOpen) {
  //     menuToggle.click(); // トグルボタンのクリックイベントを発火させて閉じる
  //   }
  // });

  // --- (オプション) ESCキーでメニューを閉じる ---
  // document.addEventListener('keydown', function(event) {
  //   if (event.key === 'Escape' && globalNavMenu.classList.contains('is-open')) {
  //     menuToggle.click();
  //   }
  // });


  // --- (オプション) トップページでヘッダーのスクロール変化 ---
  const header = document.querySelector('.header');
  if (body.classList.contains('page-top') && header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) { // 50px以上スクロールしたら
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }

  // --- (オプション) ローディングスピナーを非表示にする ---
  const loading

///動画再生
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
