(() => {
  const { $, cardHtml, searchMatches, roleMatches, notebookUrl, loadMyNotebookCards } = window.PaperTrailCommon;
  const VIEW_KEY = "paperTrailBetaMyNotebookCardView";
  let cards = [];
  let cardView = localStorage.getItem(VIEW_KEY) || "paper";

  function setCardView(nextView) {
    cardView = ["paper", "minimal", "classic"].includes(nextView) ? nextView : "paper";
    localStorage.setItem(VIEW_KEY, cardView);
    document.body.dataset.cardView = cardView;
    document.querySelectorAll("[data-card-view]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.cardView === cardView));
    });
  }

  function renderBoards() {
    const q = $("#my-search")?.value.trim() || "";
    const role = $("#my-role-filter")?.value || "";
    const filtered = cards.filter(card => searchMatches(card, q) && roleMatches(card, role));
    const empty = '<div class="empty-state"><p>条件に合うNotebookがありません。</p><a class="primary button-link" href="notebook.html">新しい論文を読む</a></div>';
    if ($("#my-list")) $("#my-list").innerHTML = cards.slice(0, 3).map(card => cardHtml(card, { variant: cardView })).join("") || empty;
    if ($("#my-cards")) $("#my-cards").innerHTML = filtered.map(card => cardHtml(card, { variant: cardView })).join("") || empty;
  }

  async function render() {
    setCardView(cardView);
    cards = await loadMyNotebookCards();
    const lastNote = $("#my-last-note");
    const continueButton = $("#continue-latest");
    const latest = cards[0];
    if (lastNote) {
      lastNote.textContent = latest
        ? `最近更新したNotebookは「${latest.title}」です。タイトルと書誌情報から読み返せます。`
        : "まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。";
    }
    if (continueButton) continueButton.href = latest ? notebookUrl(latest) : "notebook.html";
    renderBoards();
  }

  $("#my-search")?.addEventListener("input", renderBoards);
  $("#my-role-filter")?.addEventListener("change", renderBoards);
  document.querySelectorAll("[data-card-view]").forEach(button => {
    button.addEventListener("click", () => {
      setCardView(button.dataset.cardView);
      renderBoards();
    });
  });
  document.addEventListener("DOMContentLoaded", render);
})();
