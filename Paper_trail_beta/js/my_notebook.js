(() => {
  const { $, escapeHtml, cardHtml, cardHeh, cardWhy, cardStage, searchMatches, roleMatches, notebookUrl, loadMyNotebookCards } = window.PaperTrailCommon;
  let cards = [];

  function renderMiniNotes(target, picker, emptyText) {
    if (!target) return;
    const notes = cards.map(card => ({ title: card.title, text: picker(card), href: notebookUrl(card) })).filter(item => item.text).slice(0, 4);
    target.innerHTML = notes.length ? notes.map(item => `<a class="mini-note" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></a>`).join("") : `<p class="empty-mini">${escapeHtml(emptyText)}</p>`;
  }

  function renderBoards() {
    const q = $("#my-search")?.value.trim() || "";
    const role = $("#my-role-filter")?.value || "";
    const filtered = cards.filter(card => searchMatches(card, q) && roleMatches(card, role));
    const empty = '<div class="empty-state"><p>条件に合うNotebookがありません。</p><a class="primary button-link" href="notebook.html">新しい論文を読む</a></div>';
    if ($("#my-list")) $("#my-list").innerHTML = cards.slice(0, 3).map(card => cardHtml(card)).join("") || empty;
    if ($("#my-cards")) $("#my-cards").innerHTML = filtered.map(card => cardHtml(card)).join("") || empty;
  }

  async function render() {
    cards = await loadMyNotebookCards();
    const lastNote = $("#my-last-note");
    const continueButton = $("#continue-latest");
    const latest = cards[0];
    if (lastNote) {
      lastNote.textContent = latest
        ? `前回は「${latest.title}」に、${cardHeh(latest) || cardWhy(latest) || "短いメモ"}を残しました。`
        : "まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。";
    }
    if (continueButton) continueButton.href = latest ? notebookUrl(latest) : "notebook.html";
    renderBoards();
    renderMiniNotes($("#my-heh-list"), cardHeh, "まだ「へぇ！」はありません。");
    renderMiniNotes($("#my-why-list"), cardWhy, "まだ「なんで？」はありません。");
  }

  $("#my-search")?.addEventListener("input", renderBoards);
  $("#my-role-filter")?.addEventListener("change", renderBoards);
  document.addEventListener("DOMContentLoaded", render);
})();
