// src/assets/js/components/loadMoreNews.js

export function initLoadMoreNews() {
  const loadMoreButton = document.getElementById('loadMoreNewsButton')
  const newsListContainer = document.getElementById('newsListContainer')
  const allNewsDataScript = document.getElementById('allNewsData')

  // 必要な要素やデータがない場合は処理を中断
  if (!loadMoreButton || !newsListContainer || !allNewsDataScript) {
    if (loadMoreButton) {
      // ボタンが存在するが他の要素がない場合、ボタンを隠す
      loadMoreButton.style.display = 'none'
    }
    // console.warn('Load More News: Required elements not found. Initialization skipped.'); // デバッグ用
    return
  }

  let allArticles = []
  try {
    allArticles = JSON.parse(allNewsDataScript.textContent)
  } catch (e) {
    console.error('ニュースデータの解析に失敗しました:', e)
    loadMoreButton.style.display = 'none' // データがなければボタンを隠す
    return
  }

  // EJSで初期表示された記事の数を取得 (<li>要素の数を数える)
  const initiallyRenderedCount =
    newsListContainer.querySelectorAll('.news-list__item').length
  let currentIndex = initiallyRenderedCount // 次に読み込むべき記事の開始インデックス
  const articlesPerLoad = 10 // 1回に「さらに読み込む」で表示する記事の数

  // 既に全件表示されているか、記事がない場合はボタンを非表示
  if (currentIndex >= allArticles.length || allArticles.length === 0) {
    loadMoreButton.style.display = 'none'
  }

  loadMoreButton.addEventListener('click', function () {
    // newsListContainer から data属性でパス情報を取得
    const pageLinkBasePath = newsListContainer.dataset.pageLinkBasePath || './'
    const assetPath = newsListContainer.dataset.assetPath || './assets/' // デフォルト値を設定

    const articlesToLoad = allArticles.slice(
      currentIndex,
      currentIndex + articlesPerLoad,
    )

    articlesToLoad.forEach((article) => {
      const listItem = document.createElement('li')
      listItem.classList.add('news-list__item')

      const link = document.createElement('a')
      link.href = `${pageLinkBasePath}news/${article.id}/`
      link.classList.add('news-list__link')

      let articleHtml = ''

      if (article.image) {
        // 画像パスの前提: assetPath が '.../assets/' で、画像が 'assets/images/news/' にある場合
        const imageWebpSrc = `${assetPath}images/news/${article.image.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')}`
        const imageSrc = `${assetPath}images/news/${article.image}`
        // もし画像が 'assets/news/' にある場合は、パスから 'images/' を削除してください
        // const imageWebpSrc = `${assetPath}news/${article.image.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')}`;
        // const imageSrc = `${assetPath}news/${article.image}`;

        articleHtml += `
          <div class="news-list__image-wrapper">
            <picture>
              <source srcset="${imageWebpSrc}" type="image/webp" />
              <img src="${imageSrc}" alt="${article.alt || ''}" class="news-list__image" loading="lazy" />
            </picture>
          </div>`
      }

      const contentBody = article.content_html || '' // excerpt または content_html

      articleHtml += `
        <div class="news-list__content ${article.image ? '' : 'news-list__content--no-image'}">
          <time class="news-list__date" datetime="${article.date_iso}">
            ${article.date_display}
          </time>
          <h3 class="news-list__title">${article.title}</h3>
          ${contentBody ? `<div class="news-list__body">${contentBody}</div>` : ''}
        </div>`

      link.innerHTML = articleHtml
      listItem.appendChild(link)
      newsListContainer.appendChild(listItem)
    })

    currentIndex += articlesPerLoad

    if (currentIndex >= allArticles.length) {
      loadMoreButton.style.display = 'none' // 全ての記事を読み込んだらボタンを非表示
    }
  })
}
