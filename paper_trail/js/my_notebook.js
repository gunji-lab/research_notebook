(() => {
  const {
    $,
    $$,
    escapeHtml,
    requireAuth,
    loadMyNotebookCards,
    cardHtml,
    cardHeh,
    cardWhy,
    cardStage,
    searchMatches,
    roleMatches,
    notebookUrl,
    debugNotebookHtml
  } = window.PaperTrailCommon;

  let cards = [];
  let loadSeq = 0;

  function renderMiniNotes(target, picker, emptyText) {
    if (!target) return;
    const notes = cards
      .map(card => ({ title: card.title, text: picker(card), href: notebookUrl(card) }))
      .filter(item => item.text)
      .slice(0, 4);
    target.innerHTML = notes.length ? notes.map(item => `
      <a class="mini-note" href="${item.href}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.text)}</span>
      </a>
    `).join("") : `<p class="empty-mini">${escapeHtml(emptyText)}</p>`;
  }

  function renderHeader() {
    const latest = cards[0];
    const lastNote = $("#my-last-note");
    const continueButton = $("#continue-latest");
    if (latest) {
      if (lastNote) lastNote.textContent = `前回は「${latest.title}」の${cardStage(latest)}まで読みました。`;
      if (continueButton) continueButton.href = notebookUrl(latest);
    } else {
      if (lastNote) lastNote.textContent = "まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。";
      if (continueButton) continueButton.href = "notebook.html";
    }
  }

  function renderCards() {
    renderHeader();
    const recentBox = $("#my-list");
    const q = $("#my-search")?.value.trim() || "";
    const role = $("#my-role-filter")?.value || "";
    if (recentBox) {
      const recent = cards.slice(0, 3);
      recentBox.innerHTML = recent.length ? recent.map(c => cardHtml(c)).join("") :
        '<div class="empty-state"><p>まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。</p><a class="primary button-link" href="notebook.html">論文を登録する</a></div>';
    }
    const filtered = cards.filter(c => searchMatches(c, q) && roleMatches(c, role));
    const box = $("#my-cards");
    if (box) {
      box.innerHTML = filtered.length ? filtered.map(c => cardHtml(c)).join("") :
        '<div class="empty-state"><p>該当するNotebookはありません。</p></div>';
    }
    renderMiniNotes($("#my-heh-list"), cardHeh, "まだ「へぇ！」はありません。");
    renderMiniNotes($("#my-why-list"), cardWhy, "まだ「なんで？」はありません。");
  }

  async function renderEmptyWithDebug(target) {
    let debug = null;
    try {
      debug = await window.PaperTrailAPI.getMyNotebookDebug?.();
    } catch (error) {
      console.warn("PaperTrail notebook debug failed:", error);
    }
    if (Array.isArray(debug?.notebooks) && debug.notebooks.length) {
      cards = debug.notebooks.map(window.PaperTrailCommon.notebookItemToCard);
      renderCards();
      return;
    }
    target.innerHTML = `<div class="empty-state">
      <p>まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。</p>
      <a class="primary button-link" href="notebook.html">論文を登録する</a>
      ${debugNotebookHtml(debug)}
    </div>`;
  }

  async function loadCards() {
    const target = $("#my-cards");
    const recent = $("#my-list");
    if (!target) return;
    if (!requireAuth(target)) {
      if (recent) recent.innerHTML = target.innerHTML;
      return;
    }
    const seq = ++loadSeq;
    target.innerHTML = '<div class="empty">PaperTrailから読み込み中…</div>';
    if (recent) recent.innerHTML = target.innerHTML;
    try {
      cards = await loadMyNotebookCards();
      if (seq !== loadSeq) return;
      renderCards();
      if (!cards.length) await renderEmptyWithDebug(target);
    } catch (error) {
      if (seq !== loadSeq) return;
      target.innerHTML = `<div class="empty-state">
        <p>Notebookを読み込めませんでした。</p>
        <small>${escapeHtml(error.message || String(error))}</small>
        <button type="button" class="secondary" id="retry-my-notebooks">もう一度読み込む</button>
      </div>`;
      if (recent) recent.innerHTML = target.innerHTML;
      $("#retry-my-notebooks")?.addEventListener("click", loadCards);
      console.warn("PaperTrail notebook list failed:", error);
    }
  }

  function boot() {
    $("#my-search")?.addEventListener("input", renderCards);
    $("#my-role-filter")?.addEventListener("change", renderCards);
    loadCards();
  }

  window.addEventListener("papertrail:user-ready", loadCards);
  document.addEventListener("DOMContentLoaded", boot);
})();
