export function initPageTop() {
  const pageTopButton = document.getElementById('pageTopButton')

  if (pageTopButton) {
    const scrollThreshold = 200

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > scrollThreshold) {
        pageTopButton.classList.add('is-visible')
      } else {
        pageTopButton.classList.remove('is-visible')
      }
    })

    pageTopButton.addEventListener('click', function (e) {
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    })
  }
}
