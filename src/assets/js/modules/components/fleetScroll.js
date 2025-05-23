export function initFleetScrollLinks() {
  const summaryTable = document.querySelector(".page-fleet__summary-table");
  const fleetList = document.querySelector(".page-fleet__list");
  const header = document.querySelector(".header"); // 固定ヘッダーを取得

  if (!summaryTable || !fleetList) {
    // console.log('Fleet page specific elements for scroll links not found. Skipping initFleetScrollLinks.');
    return;
  }

  const summaryTableRows = summaryTable.querySelectorAll(
    "tbody tr[data-scroll-to-id]"
  );

  if (!summaryTableRows.length) {
    // console.log('No rows with data-scroll-to-id found. Skipping initFleetScrollLinks.');
    return;
  }

  summaryTableRows.forEach((row) => {
    row.addEventListener("click", function () {
      const targetId = this.dataset.scrollToId;
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerHeight = header ? header.offsetHeight : 0; // ヘッダーの高さを取得、なければ0
        const elementPosition = targetElement.getBoundingClientRect().top; // 要素のビューポートからの相対位置
        const offsetPosition =
          elementPosition + window.pageYOffset - headerHeight; // スクロール先の絶対位置（ヘッダー分を考慮）

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        console.warn(
          `Target element with ID "${targetId}" not found for scrolling.`
        );
      }
    });
  });
}
