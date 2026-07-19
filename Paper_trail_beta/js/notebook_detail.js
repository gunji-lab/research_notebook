(() => {
  const { $, escapeHtml, formatDate, cardStage, cardHeh, cardWhy, loadMyNotebookCards } = window.PaperTrailCommon;

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function value(text, fallback="まだ記録がありません。") {
    const normalized = String(text || "").trim();
    return normalized ? escapeHtml(normalized) : `<span class="muted">${escapeHtml(fallback)}</span>`;
  }

  function section(title, body) {
    return `<article class="notebook-detail-section">
      <h3>${escapeHtml(title)}</h3>
      <p>${value(body)}</p>
    </article>`;
  }

  function tagHtml(tags=[]) {
    return tags.length
      ? `<div class="tags">${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>`
      : "";
  }

  function renderNotebook(card) {
    const metaRows = [
      ["Authors", card.authors],
      ["Journal", card.journal],
      ["Year", card.year],
      ["DOI", card.doi]
    ].map(([label, text]) => `<div><dt>${label}</dt><dd>${value(text, "-")}</dd></div>`).join("");
    const trailTitle = card.backendHeh || cardHeh(card) || card.purpose || "今日の一言";
    const trailQuestion = card.backendWhy || cardWhy(card) || card.question || "";

    return `<article class="paper-notebook-detail">
      <header class="paper-notebook-head">
        <span class="eyebrow">PAPER NOTEBOOK</span>
        <h2>${escapeHtml(card.title || "Untitled")}</h2>
        <dl class="paper-notebook-meta">${metaRows}</dl>
        <div class="paper-notebook-tags">
          <span class="level-badge">${escapeHtml(cardStage(card))}</span>
          ${tagHtml(card.tags || [])}
        </div>
      </header>

      <section class="notebook-detail-body">
        <div class="notebook-detail-title">
          <span class="eyebrow">MY RESEARCH NOTEBOOK</span>
          <h2>自分の言葉で残したこと</h2>
          <p>最終更新 ${escapeHtml(formatDate(card.updatedAt || card.createdAt))}</p>
        </div>
        ${section("読む理由", card.wantToKnow || card.purpose)}
        ${section("さくっと読んで理解したこと", card.results)}
        ${section("重要ポイント", card.interpretation || card.backendHeh)}
        ${section("疑問", card.question || card.gap || card.backendWhy)}
        ${section("自分の研究との関係", card.relation)}
      </section>

      <section class="notebook-detail-trail">
        <div class="notebook-detail-title">
          <span class="eyebrow">TRAIL</span>
          <h2>考えの履歴</h2>
        </div>
        <article class="trail-entry">
          <time>${escapeHtml(formatDate(card.updatedAt || card.createdAt))}</time>
          <h3>${value(trailTitle, "今日の一言")}</h3>
          <p>${value(trailQuestion, "次に読み返したときの疑問をここに重ねていきます。")}</p>
        </article>
      </section>
    </article>`;
  }

  async function render() {
    const root = $("#notebook-detail-root");
    if (!root) return;
    const id = params().get("notebook") || "";
    const cards = await loadMyNotebookCards();
    const card = cards.find(item => item.id === id || item.notebookId === id) || cards[0];
    if (!card) {
      root.innerHTML = `<div class="empty-state"><p>表示できるNotebookがありません。</p><a class="primary button-link" href="my_notebook.html">My Notebookへ戻る</a></div>`;
      return;
    }
    root.innerHTML = renderNotebook(card);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
