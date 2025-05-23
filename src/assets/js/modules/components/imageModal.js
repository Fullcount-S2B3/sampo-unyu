export function initImageModal() {
  const modal = document.getElementById('imageModal')
  const modalImage = document.getElementById('modalImage')
  const modalCaption = document.getElementById('modalCaption')
  const closeModalButton = modal
    ? modal.querySelector('.image-modal__close-button')
    : null
  const triggerImages = document.querySelectorAll('.js-modal-trigger')

  if (
    !modal ||
    !modalImage ||
    !closeModalButton ||
    triggerImages.length === 0
  ) {
    // console.warn('Image Modal: Required elements not found. Initialization skipped.');
    return
  }

  triggerImages.forEach((img) => {
    img.addEventListener('click', function () {
      modal.classList.add('is-visible')
      modalImage.src = this.src // クリックされた画像のsrcをモーダル画像に設定
      if (this.alt) {
        modalCaption.textContent = this.alt // alt属性をキャプションに設定
        modalCaption.style.display = 'block'
      } else {
        modalCaption.style.display = 'none'
      }
    })
  })

  // 閉じるボタンがクリックされたときの処理
  closeModalButton.addEventListener('click', function () {
    modal.classList.remove('is-visible')
    modalImage.src = '' // モーダルを閉じる際に画像をクリア（任意）
    modalCaption.textContent = '' // キャプションもクリア
  })

  // モーダルの背景（画像以外）がクリックされたときの処理
  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      // クリックされたのがモーダル背景自身か確認
      modal.classList.remove('is-visible')
      modalImage.src = ''
      modalCaption.textContent = ''
    }
  })

  // Escapeキーでモーダルを閉じる
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-visible')) {
      modal.classList.remove('is-visible')
      modalImage.src = ''
      modalCaption.textContent = ''
    }
  })
}
