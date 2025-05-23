import Splide from '@splidejs/splide'

export function initFleetSplideSliders() {
  const sliderElements = document.querySelectorAll(
    '.page-fleet__item .fleet-item-slider',
  )

  if (!sliderElements.length) {
    // console.log('No Splide sliders found for fleet items.');
    return
  }

  sliderElements.forEach((element) => {
    const splide = new Splide(element, {
      // Splideオプション
      type: 'slide', // 'loop' にすると画像1枚でもクローンが作られるので注意。'slide'が良い。
      perPage: 1,
      gap: '1rem', // スライド間のスペース (必要に応じて)
      pagination: true, // ページネーション（ドット）を表示
      arrows: true, // 矢印ナビゲーションを表示
      // 他にも多くのオプションがあります。詳細はSplideのドキュメントを参照してください。
      //例: keyboard: 'global', drag: true, etc.
    })

    // マウント前にスライド数をチェック
    const slideCount = element.querySelectorAll('.splide__slide').length

    if (slideCount <= 1) {
      // スライドが1枚以下の場合、特定のクラスを付与してCSSでUIを非表示にする
      element.classList.add('is-single-slide')
      // さらにSplideのオプションでナビゲーションとページネーションを無効化することも可能
      splide.options.arrows = false
      splide.options.pagination = false
      // typeを'loop'にしている場合は、'slide'に変更するか、
      // もしくはループさせないように他の設定も検討。
      // 今回はtype: 'slide'を基本としているので、arrowとpaginationの制御で十分
    }

    splide.mount()
  })
}
