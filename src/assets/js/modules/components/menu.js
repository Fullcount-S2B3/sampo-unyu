export function initMenu() {
  const menuToggle = document.querySelector(".header__menu-toggle");
  const navGlobal = document.querySelector(".nav-global");
  const body = document.body;

  const anchorIcon = menuToggle
    ? menuToggle.querySelector(".header__menu-icon--anchor")
    : null;
  const closeIcon = menuToggle
    ? menuToggle.querySelector(".header__menu-icon--close")
    : null;

  if (menuToggle && navGlobal) {
    menuToggle.addEventListener("click", function () {
      const isOpen = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!isOpen));
      navGlobal.classList.toggle("is-open");
      body.classList.toggle("nav-open"); // bodyにクラスを付与してoverflow:hiddenなどを制御
      menuToggle.classList.toggle("is-active");

      if (anchorIcon && closeIcon) {
        anchorIcon.classList.toggle("is-visible", isOpen); // 閉じるならanchor表示
        anchorIcon.setAttribute("aria-hidden", String(!isOpen));
        closeIcon.classList.toggle("is-visible", !isOpen); // 開くならclose表示
        closeIcon.setAttribute("aria-hidden", String(isOpen));
      }
    });
  }

  const submenuToggles = document.querySelectorAll(
    ".nav-global__item.has-submenu > .nav-global__link"
  );

  submenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      const parentItem = this.parentElement;
      if (!parentItem || !parentItem.classList.contains("has-submenu")) return;

      event.preventDefault(); // サブメニューを持つリンクのデフォルト動作を阻止

      const submenu = parentItem.querySelector(".nav-global__submenu");
      const isOpen = parentItem.classList.contains("is-submenu-open");

      parentItem.classList.toggle("is-submenu-open");
      this.setAttribute("aria-expanded", String(!isOpen));

      if (submenu) {
        if (!isOpen) {
          submenu.style.maxHeight = submenu.scrollHeight + "px";
          // submenu.style.paddingTop = "0.5rem"; // 必要ならスタイル調整
          // submenu.style.paddingBottom = "0.5rem";
        } else {
          submenu.style.maxHeight = null;
          // submenu.style.paddingTop = null;
          // submenu.style.paddingBottom = null;
        }
      }
    });
  });
}
