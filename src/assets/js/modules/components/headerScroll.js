export function initHeaderScroll() {
  const header = document.querySelector(".header");
  const body = document.body;

  if (body.classList.contains("page-top") && header) {
    let isScrolled = false; // スクロール状態を保持
    const scrollThreshold = 50; // 変化の閾値

    const updateHeaderState = () => {
      if (window.scrollY > scrollThreshold) {
        if (!isScrolled) {
          header.classList.add("header--scrolled");
          isScrolled = true;
        }
      } else {
        if (isScrolled) {
          header.classList.remove("header--scrolled");
          isScrolled = false;
        }
      }
    };
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState(); // 初期状態もチェック
  }
}
