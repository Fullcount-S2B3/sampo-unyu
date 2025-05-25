export function initImageModal() {
  const modal = document.getElementById('imageModal')
  const modalImage = document.getElementById('modalImage')
  const modalCaption = document.getElementById('modalCaption')
  const closeModalButton = modal
    ? modal.querySelector('.image-modal__close-button')
    : null
  const triggerImages = document.querySelectorAll('.js-modal-trigger')

  // CSSで設定したトランジション時間 (0.4s) + バッファ (50ms)
  const transitionDuration = 450

  if (
    !modal ||
    !modalImage ||
    !closeModalButton ||
    triggerImages.length === 0
  ) {
    return
  }

  // --- 開く処理 ---
  triggerImages.forEach((img) => {
    img.addEventListener('click', function () {
      modalImage.src = this.src // 先にsrcを設定
      if (this.alt) {
        modalCaption.textContent = this.alt
        modalCaption.style.display = 'block'
      } else {
        modalCaption.style.display = 'none'
        modalCaption.textContent = ''
      }
      modal.classList.add('is-visible') // src設定後にクラスを追加
    })
  })

  // --- 閉じる処理 (setTimeout を使用) ---
  function closeModalAndClear() {
    // すでに非表示処理中の場合は何もしない
    if (!modal.classList.contains('is-visible')) {
      return
    }

    // 1. まずクラスを削除してトランジションを開始
    modal.classList.remove('is-visible')

    // 2. トランジション時間後に src と caption をクリア
    setTimeout(() => {
      console.log('Clearing image src via setTimeout...') // デバッグ用
      modalImage.src = ''
      modalCaption.textContent = ''
    }, transitionDuration) // 設定した時間後に実行
  }

  // --- 閉じるイベントリスナー ---
  closeModalButton.addEventListener('click', closeModalAndClear)

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModalAndClear()
    }
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-visible')) {
      closeModalAndClear()
    }
  })
}
