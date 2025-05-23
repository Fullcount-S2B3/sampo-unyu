const loadingSpinner = document.querySelector(".loading-spinner");

export function showLoading() {
  if (loadingSpinner) {
    // is-hidden クラスがあってもなくても、まずローディング状態にする
    loadingSpinner.classList.remove("is-hidden");
    loadingSpinner.classList.add("is-loading");
  }
}

export function hideLoading() {
  if (loadingSpinner) {
    loadingSpinner.classList.remove("is-loading");
    loadingSpinner.classList.add("is-hidden");
  }
}
