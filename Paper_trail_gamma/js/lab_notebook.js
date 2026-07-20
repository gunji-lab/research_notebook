(() => {
  const { $ } = window.PaperTrailCommon;
  function render() {
    const target = $("#lab-list");
    if (target) target.innerHTML = '<div class="empty-state"><p>共有されたNotebookはまだありません。</p></div>';
  }
  document.addEventListener("DOMContentLoaded", render);
})();
