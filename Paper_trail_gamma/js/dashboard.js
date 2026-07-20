(() => {
  const { $ } = window.PaperTrailCommon;
  function render() {
    const target = $("#dashboard-content");
    if (target) target.innerHTML = '<div class="empty-state"><p>学習データの保存・集計機能は現在接続していません。</p></div>';
  }
  document.addEventListener("DOMContentLoaded", render);
})();
