(() => {
  const {
    $,
    escapeHtml,
    requireAuth,
    notebookItemToCard,
    cardHtml,
    searchMatches,
    roleMatches
  } = window.PaperTrailCommon;

  let cards = [];

  function renderCards() {
    const q = $("#lab-search")?.value.trim() || "";
    const role = $("#lab-role-filter")?.value || "";
    const target = $("#lab-list");
    if (!target) return;
    const filtered = cards.filter(c => searchMatches(c, q) && roleMatches(c, role));
    target.innerHTML = filtered.length ? filtered.map(c => cardHtml(c, { lab:true })).join("") :
      '<div class="empty-state"><p>共有されたNotebookはまだありません。</p></div>';
  }

  async function loadCards() {
    const target = $("#lab-list");
    if (!target) return;
    if (!requireAuth(target, "大学アカウントでログインすると、ラボ共有Notebookが表示されます。")) return;
    target.innerHTML = '<div class="empty">ラボのNotebookを読み込み中…</div>';
    try {
      const items = await window.PaperTrailAPI.listLabNotebooks();
      cards = Array.isArray(items) ? items.map(notebookItemToCard) : [];
      renderCards();
    } catch (error) {
      target.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message || "ラボNotebookを読み込めませんでした。")}</p></div>`;
      console.warn("PaperTrail lab notebook failed:", error);
    }
  }

  function boot() {
    $("#lab-search")?.addEventListener("input", renderCards);
    $("#lab-role-filter")?.addEventListener("change", renderCards);
    loadCards();
  }

  window.addEventListener("papertrail:user-ready", loadCards);
  document.addEventListener("DOMContentLoaded", boot);
})();
