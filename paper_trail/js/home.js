(() => {
  const {
    $,
    escapeHtml,
    showToast,
    requireAuth,
    loadMyNotebookCards,
    notebookUrl,
    cardStage
  } = window.PaperTrailCommon;

  function redirectLegacyRoute() {
    const params = new URLSearchParams(location.search);
    const rawHash = location.hash.replace(/^#/, "");
    const route = params.get("view") || rawHash;
    const map = {
      new: "notebook.html",
      mine: "my_notebook.html",
      lab: "lab_notebook.html",
      dashboard: "dashboard.html"
    };
    if (map[route]) {
      location.replace(map[route]);
      return true;
    }
    return false;
  }

  function setHomeGreeting() {
    const h = new Date().getHours();
    const text = h < 11 ? "おはようございます。" : h < 18 ? "こんにちは。" : "こんばんは。";
    const el = $("#home-greeting");
    if (el) el.textContent = text;
  }

  function renderContinueEmpty(message) {
    const box = $("#continue-card");
    if (!box) return;
    box.innerHTML = `<div class="continue-empty">
      <p>${escapeHtml(message)}</p>
      <a class="secondary button-link" href="notebook.html">最初の1本を開く</a>
    </div>`;
  }

  async function renderContinueCard() {
    const box = $("#continue-card");
    if (!box) return;
    if (!requireAuth(null)) {
      renderContinueEmpty("大学アカウントでログインすると、前回の続きがここに表示されます。");
      return;
    }
    box.innerHTML = '<div class="empty">PaperTrailから読み込み中…</div>';
    try {
      const cards = await loadMyNotebookCards();
      if (!cards.length) {
        renderContinueEmpty("まだ読みかけの論文はありません。");
        return;
      }
      const c = cards[0];
      const meta = [c.authors, c.year, cardStage(c)].filter(Boolean).join(" · ");
      box.innerHTML = `<div class="continue-main">
        <div>
          <span class="eyebrow">LAST OPENED</span>
          <h3>${escapeHtml(c.title)}</h3>
          <p class="continue-meta">${escapeHtml(meta || "自分のNotebook")}</p>
          <p class="continue-snippet">${escapeHtml(c.wantToKnow || c.purpose || "前回の続きから、少しずつ読み進めましょう。")}</p>
        </div>
        <a class="primary button-link" href="${notebookUrl(c)}">続きから読む</a>
      </div>`;
    } catch (error) {
      renderContinueEmpty(error.message || "Notebookを読み込めませんでした。");
      console.warn("PaperTrail home continue failed:", error);
    }
  }

  async function renderLabActivity() {
    const box = $("#home-lab-activity");
    if (!box) return;
    if (!requireAuth(null)) {
      box.innerHTML = '<div class="empty-state"><p>ログイン後、ラボの最近の動きが表示されます。</p></div>';
      return;
    }
    box.innerHTML = '<div class="empty">ラボのNotebookを読み込み中…</div>';
    try {
      const items = await window.PaperTrailAPI.listLabNotebooks();
      const cards = Array.isArray(items) ? items.slice(0, 3) : [];
      box.innerHTML = cards.length ? cards.map(c => `
        <article class="lab-activity-card card">
          <div class="lab-activity-person">${escapeHtml(c.displayName || c.nickname || c.studentId || "Lab member")}</div>
          <h3>${escapeHtml(c.title || "Untitled")}</h3>
          <p>${escapeHtml(c.question || c.gap || c.doi || "新しいNotebookが追加されました。")}</p>
          <div class="lab-activity-reactions">${escapeHtml(c.readingLevel || "quick")}</div>
        </article>
      `).join("") : '<div class="empty-state"><p>共有されたNotebookはまだありません。</p></div>';
    } catch (error) {
      box.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message || "ラボの動きを読み込めませんでした。")}</p></div>`;
      console.warn("PaperTrail home lab failed:", error);
    }
  }

  function boot() {
    if (redirectLegacyRoute()) return;
    setHomeGreeting();
    $("#home-doi-button")?.addEventListener("click", event => {
      const doi = $("#home-doi")?.value.trim();
      if (!doi) return;
      event.preventDefault();
      showToast("DOI自動取得は次の開発フェーズで実装します。");
    });
    renderContinueCard();
    renderLabActivity();
  }

  window.addEventListener("papertrail:user-ready", () => {
    renderContinueCard();
    renderLabActivity();
  });
  document.addEventListener("DOMContentLoaded", boot);
})();
