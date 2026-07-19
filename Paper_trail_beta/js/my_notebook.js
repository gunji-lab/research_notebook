(() => {
  const { $, escapeHtml, cardHtml, cardHeh, cardWhy, cardStage, searchMatches, roleMatches, notebookUrl } = window.PaperTrailCommon;
  const cards = [];

  function renderMiniNotes(target, picker, emptyText) {
    if (!target) return;
    const notes = cards.map(card => ({ title: card.title, text: picker(card), href: notebookUrl(card) })).filter(item => item.text).slice(0, 4);
    target.innerHTML = notes.length ? notes.map(item => `<a class="mini-note" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></a>`).join("") : `<p class="empty-mini">${escapeHtml(emptyText)}</p>`;
  }

  function render() {
    const lastNote = $("#my-last-note");
    const continueButton = $("#continue-latest");
    if (lastNote) lastNote.textContent = "まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。";
    if (continueButton) continueButton.href = "notebook.html";
    const empty = '<div class="empty-state"><p>まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。</p><a class="primary button-link" href="notebook.html">論文を登録する</a></div>';
    if ($("#my-list")) $("#my-list").innerHTML = empty;
    if ($("#my-cards")) $("#my-cards").innerHTML = empty;
    renderMiniNotes($("#my-heh-list"), cardHeh, "まだ「へぇ！」はありません。");
    renderMiniNotes($("#my-why-list"), cardWhy, "まだ「なんで？」はありません。");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
