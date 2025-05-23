// ./modules/components/messageTitleAnimation.js

export function initMessageTitleAnimation() {
  const titleElement = document.querySelector(".message-section__title");

  if (!titleElement) {
    // console.warn('Element with class "message-section__title" for animation not found.');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // 一度表示されたら監視を解除する場合
          // observer.unobserve(entry.target);
        } else {
          // 画面外に出たらクラスを削除して再度アニメーションさせたい場合
          // entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      root: null,
      // rootMargin: '上下のオフセット 左右のオフセット 上下のオフセット 左右のオフセット'
      // 例えば、ビューポートの上端から30%、下端から30%内側を検知エリアの境界とする
      // これにより、要素が画面中央の約40%の範囲に入ったときに isIntersecting が true になりやすくなります。
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0, // 要素が少しでも検知エリアに入ったらトリガー (0.001など微小な値でも良い)
      // rootMarginでエリアを絞っているので、thresholdは0かそれに近い値で良いことが多い
    }
  );

  observer.observe(titleElement);
}
