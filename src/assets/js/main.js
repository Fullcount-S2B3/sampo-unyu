// js/main.js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import '@splidejs/splide/css/core'; // Splide CSSの読み込み方法に応じて調整

// --- 全ページで読み込むモジュール ---
import { showLoading, hideLoading } from './modules/utils/loadingSpinner.js' //
import { initMenu } from './modules/components/menu.js' //
import { initHeaderScroll } from './modules/components/headerScroll.js' //
import { initPageTop } from './modules/components/pageTop.js'
import { initPageHeaderTitleAnimation } from './modules/animations/pageHeaderTitleAnimation.js' //

// --- HOMEページ専用モジュール ---
import { initHeroAnimations } from './modules/animations/heroAnimations.js' //
import { initMessageTitleAnimation } from './modules/components/messageTitleAnimation.js' //
import { initParallax } from './modules/animations/parallax.js' //

// --- FLEETページ専用モジュール ---
import { initFleetScrollLinks } from './modules/components/fleetScroll.js'
import { initFleetSplideSliders } from './modules/components/fleetSplideSliders.js'

// --- NEWSページ関連モジュール ---
import { initLoadMoreNews } from './modules/components/loadMoreNews.js' // NEWS一覧用
import { initImageModal } from './modules/components/imageModal.js' // NEWS詳細用

gsap.registerPlugin(ScrollTrigger)

showLoading() // ローディング表示を開始

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed. Initializing modules...')

  // 全ページで初期化するモジュール
  initMenu() //
  initHeaderScroll() //
  initPageTop()
  initPageHeaderTitleAnimation() //

  const currentPageId = document.body.dataset.pageId

  if (currentPageId === 'home') {
    console.log('Initializing HOME page modules...')
    initHeroAnimations() // ホームページの場合はヒーローアニメーションを初期化 (ここでローディング非表示が制御される)
    initMessageTitleAnimation() //
    initParallax() //
  } else if (currentPageId === 'fleet') {
    console.log('Initializing FLEET page modules...')
    initFleetScrollLinks()
    initFleetSplideSliders()
  } else if (currentPageId === 'news') {
    // ★ NEWS一覧ページ (pageId='news' と仮定)
    console.log('Initializing NEWS list page modules...')
    initLoadMoreNews() // NEWS一覧でのみ実行
  } else if (currentPageId === 'news-detail') {
    // ★ NEWS詳細ページ (pageId='news-detail' と仮定)
    console.log('Initializing NEWS detail page modules...')
    initImageModal() // NEWS詳細でのみ実行
  }

  // DOMContentLoadedでのフォールバックタイマーを削除
  // const fallbackSpinner = document.querySelector('.loading-spinner.is-loading');
  // if (fallbackSpinner) {
  //   setTimeout(() => {
  //     console.log('Fallback: Hiding loading spinner via main.js timeout.');
  //     hideLoading();
  //   }, 1000);
  // }
})

window.addEventListener('load', () => {
  const currentPageId = document.body.dataset.pageId

  // ホームページ *以外* の場合のみ、window.loadでローディングを非表示にする
  // ホームページの場合は heroAnimations.js が非表示を管理する
  if (currentPageId !== 'home') {
    const finalSpinnerCheck = document.querySelector(
      '.loading-spinner.is-loading',
    )
    if (finalSpinnerCheck) {
      console.log(
        'Window.load: Hiding loading spinner for non-home page as a final measure.',
      )
      hideLoading() //
    }
  } else {
    console.log('Window.load: On home page, heroAnimations will handle hiding.')
  }
})
