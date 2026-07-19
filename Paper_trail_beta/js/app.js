import {
  getDashboard,
  getFavorites,
  getLabNotebooks,
  getNotebook,
  getNotebookList,
  getPaper,
  getTrail,
  saveNotebook,
  searchPaper
} from "./dataService.js";

const app = document.querySelector("#app");
const navLinks = [...document.querySelectorAll(".nav-tabs a")];

const state = {
  lastQuery: ""
};

function routeInfo() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const [path] = hash.split("?");
  const [route, id] = path.split("/");
  return { route, id };
}

function setActive(route) {
  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.route === route);
  });
}

function html(strings, ...values) {
  return strings.reduce((result, string, index) => {
    const value = values[index] ?? "";
    return result + string + value;
  }, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tags(items = []) {
  return items.map(item => `<span class="tag">${escapeHtml(item)}</span>`).join("");
}

function statusLabel(status) {
  const labels = {
    reading: "読みかけ",
    saved: "保存済み",
    skimmed: "さくっと読了",
    "deep dive": "深掘り中"
  };
  return labels[status] || status || "Notebook";
}

function paperCard(paper) {
  return html`
    <article class="paper-card">
      <div>
        <p class="eyebrow">${escapeHtml(paper.year)} / ${escapeHtml(paper.journal)}</p>
        <h3 class="paper-title">${escapeHtml(paper.title)}</h3>
        <p class="paper-meta">${escapeHtml(paper.authors)}</p>
      </div>
      <p class="paper-abstract">${escapeHtml(paper.abstract)}</p>
      <div class="tag-row">${tags(paper.tags)}</div>
      <div class="card-actions">
        <a class="button secondary" href="#paper/${paper.id}">論文を見る</a>
        <a class="button primary" href="#notebook/${paper.notebookId}">Notebookへ</a>
      </div>
    </article>
  `;
}

function bookCard(notebook) {
  return html`
    <article class="book-card">
      <div class="book-card-top">
        <span class="status-pill">${escapeHtml(statusLabel(notebook.status))}</span>
        <span class="book-date">${escapeHtml(notebook.updatedAt)}</span>
      </div>
      <div>
        <p class="eyebrow">Reading Record</p>
        <h3>${escapeHtml(notebook.shortTitle || notebook.title)}</h3>
      </div>
      <p class="book-note">“${escapeHtml(notebook.note)}”</p>
      <div class="book-stats">
        <span>${escapeHtml(notebook.trailCount ?? 0)} Trails</span>
        <span>${escapeHtml(notebook.progress)}% notebook</span>
      </div>
      <div class="card-actions">
        <a class="button primary" href="#notebook/${notebook.id}">Notebookを開く</a>
        <a class="button secondary" href="#trail/${notebook.paperId}">思考の履歴</a>
      </div>
    </article>
  `;
}

function trailCard(trail) {
  return html`
    <article class="trail-card">
      <div class="trail-date">${escapeHtml(trail.date)}</div>
      <div>
        <p class="eyebrow">${escapeHtml(trail.kind)}</p>
        <h3>${escapeHtml(trail.title)}</h3>
        <p>${escapeHtml(trail.body)}</p>
        <p class="trail-meta">${escapeHtml(trail.paperTitle)}</p>
      </div>
    </article>
  `;
}

async function renderHome() {
  const [dashboard, papers, notebooks, trails] = await Promise.all([
    getDashboard(),
    searchPaper(""),
    getNotebookList(),
    getTrail()
  ]);
  app.innerHTML = html`
    <section class="hero">
      <div>
        <p class="eyebrow">PaperTrail Beta v3.5</p>
        <h1>論文を読む時間を、研究ノートに変える。</h1>
        <p>検索、読解、Notebook、Trail、本棚をすべてMock Dataで動かすUIプロトタイプです。GASや認証には接続していません。</p>
        <div class="search-box">
          <input class="input" id="homeSearch" placeholder="キーワード、著者、テーマで探す" value="${escapeHtml(state.lastQuery)}">
          <button class="button primary" id="homeSearchButton">探す</button>
        </div>
      </div>
      <aside class="quick-panel">
        <h2>今日の入口</h2>
        <p>前回の続きを開くか、新しい論文を軽く眺めてからNotebookへ進めます。</p>
        <div class="card-actions">
          <a class="button primary" href="#notebook/${notebooks[0].id}">前回のNotebook</a>
          <a class="button secondary" href="#search">新しい論文</a>
        </div>
      </aside>
    </section>

    <section class="stats-grid">
      <article class="stat-card"><p class="eyebrow">Papers</p><h3>${dashboard.papers}</h3><p>読める論文</p></article>
      <article class="stat-card"><p class="eyebrow">Notebooks</p><h3>${dashboard.notebooks}</h3><p>自分の研究ノート</p></article>
      <article class="stat-card"><p class="eyebrow">Trails</p><h3>${dashboard.trails}</h3><p>読み返しの記録</p></article>
    </section>

    <div class="section-head">
      <div><p class="eyebrow">Recent</p><h2>最近開いた論文</h2><p>本棚へ戻る前の短い入口です。</p></div>
      <a class="button ghost" href="#my">本棚へ</a>
    </div>
    <section class="paper-grid">${papers.slice(0, 3).map(paperCard).join("")}</section>

    <div class="section-head">
      <div><p class="eyebrow">Trail</p><h2>最近の考え</h2></div>
      <a class="button ghost" href="#trail">Trailを見る</a>
    </div>
    <section class="trail-grid">${trails.slice(0, 3).map(trailCard).join("")}</section>
  `;

  app.querySelector("#homeSearchButton").addEventListener("click", () => {
    state.lastQuery = app.querySelector("#homeSearch").value.trim();
    location.hash = `search?q=${encodeURIComponent(state.lastQuery)}`;
  });
}

async function renderSearch() {
  const queryFromHash = new URLSearchParams(location.hash.split("?")[1] || "").get("q") || state.lastQuery;
  const papers = await searchPaper(queryFromHash);
  state.lastQuery = queryFromHash;
  app.innerHTML = html`
    <section class="page-title">
      <p class="eyebrow">Search</p>
      <h1>読む論文を探す</h1>
      <p>OpenAlexではなくMock Dataから検索しています。画面体験だけを確認するための検索です。</p>
      <div class="search-box">
        <input class="input" id="searchInput" placeholder="microbiome, ecology, method..." value="${escapeHtml(queryFromHash)}">
        <button class="button primary" id="searchButton">検索</button>
      </div>
    </section>
    <div class="section-head">
      <div><p class="eyebrow">${papers.length} results</p><h2>検索結果</h2></div>
    </div>
    <section class="paper-grid">${papers.length ? papers.map(paperCard).join("") : `<div class="empty">該当する論文がありません。</div>`}</section>
  `;
  app.querySelector("#searchButton").addEventListener("click", () => {
    state.lastQuery = app.querySelector("#searchInput").value.trim();
    location.hash = `search?q=${encodeURIComponent(state.lastQuery)}`;
  });
}

async function renderPaper(id) {
  const paper = await getPaper(id);
  const trails = await getTrail(paper.id);
  app.innerHTML = html`
    <section class="paper-layout">
      <article class="paper-reader">
        <p class="eyebrow">Paper Viewer</p>
        <h1>${escapeHtml(paper.title)}</h1>
        <dl class="meta-list">
          <div><dt>Authors</dt><dd>${escapeHtml(paper.authors)}</dd></div>
          <div><dt>Journal</dt><dd>${escapeHtml(paper.journal)} (${escapeHtml(paper.year)})</dd></div>
          <div><dt>DOI</dt><dd>${escapeHtml(paper.doi)}</dd></div>
        </dl>
        <section class="abstract-block">
          <h2>Abstract</h2>
          <p>${escapeHtml(paper.abstract)}</p>
        </section>
        ${paper.sections.map(section => html`
          <section class="reader-section">
            <h2>${escapeHtml(section.heading)}</h2>
            <p>${escapeHtml(section.body)}</p>
          </section>
        `).join("")}
      </article>
      <aside class="side-panel">
        <section class="note-panel">
          <h2>読み方を選ぶ</h2>
          <p>全部読まなくても大丈夫。目的に合わせてNotebookへ進めます。</p>
          <div class="card-actions">
            <a class="button primary" href="#notebook/${paper.notebookId}">Notebookを書く</a>
            <a class="button secondary" href="#trail/${paper.id}">Trailを見る</a>
          </div>
        </section>
        <section class="note-panel">
          <h2>この論文のTrail</h2>
          <div class="note-list">${trails.map(trail => `<div class="note-item">${escapeHtml(trail.title)}</div>`).join("")}</div>
        </section>
      </aside>
    </section>
  `;
}

async function renderNotebook(id) {
  const notebook = await getNotebook(id);
  const trails = await getTrail(notebook.paperId);
  app.innerHTML = html`
    <article class="notebook-page research-notebook">
      <header class="paper-cover">
        <div>
          <p class="eyebrow">Paper Cover</p>
          <h1>${escapeHtml(notebook.title)}</h1>
          <p class="cover-subtitle">${escapeHtml(notebook.authors)}</p>
        </div>
        <dl class="cover-meta">
          <div><dt>Journal</dt><dd>${escapeHtml(notebook.journal)}</dd></div>
          <div><dt>Year</dt><dd>${escapeHtml(notebook.year)}</dd></div>
          <div><dt>DOI</dt><dd>${escapeHtml(notebook.doi)}</dd></div>
        </dl>
        <div class="tag-row cover-tags">${tags(notebook.keywords || [])}</div>
      </header>

      <section class="notebook-intro">
        <p class="eyebrow">My Research Notebook</p>
        <h2>${escapeHtml(notebook.shortTitle || "自分の研究ノート")}</h2>
        <p>小さなメモを、読み返したくなる研究ノートとして残します。</p>
      </section>

      <form class="notebook-form" id="notebookForm">
        ${notebook.sections.map(section => html`
          <section class="notebook-section">
            <div class="field-stack">
              <label for="${section.key}">${escapeHtml(section.label)}</label>
              <textarea class="textarea" id="${section.key}" name="${section.key}">${escapeHtml(section.value)}</textarea>
            </div>
          </section>
        `).join("")}
        <section class="notebook-section">
          <h2>Trail</h2>
          <p>読み返すたびに、考えが少しずつ育っていく場所です。</p>
          <div class="mini-trails">${trails.slice(0, 3).map(trailCard).join("") || `<div class="empty">まだTrailはありません。</div>`}</div>
          <div class="card-actions">
            <a class="button secondary" href="#trail/${notebook.paperId}">Trailを開く</a>
            <button class="button primary" type="submit">Notebookを保存</button>
          </div>
          <p id="saveStatus" class="paper-meta"></p>
        </section>
      </form>
    </article>
  `;

  app.querySelector("#notebookForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = {
      ...notebook,
      sections: notebook.sections.map(section => ({
        ...section,
        value: form.get(section.key)
      }))
    };
    await saveNotebook(updated);
    app.querySelector("#saveStatus").textContent = "Mock Dataに保存した想定です。画面遷移と保存体験だけを確認できます。";
  });
}

async function renderMyNotebook() {
  const notebooks = await getNotebookList();
  app.innerHTML = html`
    <section class="page-title">
      <p class="eyebrow">My Notebook</p>
      <h1>研究室の本棚に、自分の読み跡が並ぶ。</h1>
      <p>ここでは論文情報を詰め込みません。今日はどのノートを開きたいか、読書記録として選べる場所にします。</p>
    </section>
    <section class="bookshelf">${notebooks.map(bookCard).join("")}</section>
  `;
}

async function renderLabNotebook() {
  const notebooks = await getLabNotebooks();
  app.innerHTML = html`
    <section class="page-title">
      <p class="eyebrow">Lab Notebook</p>
      <h1>研究室の読み跡</h1>
      <p>誰が何を読んで、どんな観点を残しているかを静かに眺める場所です。</p>
    </section>
    <section class="lab-grid">
      ${notebooks.map(item => html`
        <article class="lab-card">
          <div class="book-card-top">
            <p class="eyebrow">${escapeHtml(item.reader)}</p>
            <span class="book-date">${escapeHtml(item.updatedAt)}</span>
          </div>
          <h3>${escapeHtml(item.shortTitle || item.title)}</h3>
          <p class="lab-meta">${escapeHtml(item.trailCount ?? 0)} Trails / ${escapeHtml(statusLabel(item.status))}</p>
          <p>${escapeHtml(item.summary)}</p>
          <div class="tag-row">${tags(item.tags)}</div>
          <div class="card-actions">
            <a class="button primary" href="#notebook/${item.id}">Notebookを見る</a>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

async function renderTrail(paperId) {
  const trails = await getTrail(paperId);
  app.innerHTML = html`
    <section class="page-title">
      <p class="eyebrow">Trail</p>
      <h1>理解が育っていく時間。</h1>
      <p>Trailは読書履歴ではなく、思考の履歴です。その日に残した一言が、次に読む自分の手がかりになります。</p>
    </section>
    <section class="trail-timeline">${trails.map(trailCard).join("")}</section>
    <section class="note-panel trail-compose">
      <h2>新しいTrail</h2>
      <div class="split">
        <input class="input" id="trailTitle" placeholder="タイトル">
        <select class="select" id="trailKind">
          <option>気づき</option>
          <option>疑問</option>
          <option>方法メモ</option>
          <option>次に読む</option>
        </select>
      </div>
      <textarea class="textarea" id="trailBody" placeholder="今日考えたことを短く書く"></textarea>
      <button class="button primary" id="addTrailButton">Trailを追加</button>
      <p class="paper-meta" id="trailStatus"></p>
    </section>
  `;

  app.querySelector("#addTrailButton").addEventListener("click", () => {
    const title = app.querySelector("#trailTitle").value.trim() || "新しいTrail";
    const kind = app.querySelector("#trailKind").value;
    const body = app.querySelector("#trailBody").value.trim() || "ここに今日考えたことが入ります。";
    const created = {
      date: new Date().toISOString().slice(0, 10),
      kind,
      title,
      body,
      paperTitle: "Mock Data"
    };
    app.querySelector(".trail-timeline").insertAdjacentHTML("afterbegin", trailCard(created));
    app.querySelector("#trailStatus").textContent = "Mock Dataに追加した想定です。リロードすると初期状態に戻ります。";
    app.querySelector("#trailTitle").value = "";
    app.querySelector("#trailBody").value = "";
  });
}

async function renderSettings() {
  const favorites = await getFavorites();
  app.innerHTML = html`
    <section class="page-title">
      <p class="eyebrow">Settings</p>
      <h1>研究ノートの環境</h1>
      <p>今はUI確認用の設定画面です。認証、GAS、Spreadsheetには接続していません。</p>
    </section>
    <section class="settings-grid">
      <article class="note-panel">
        <h2>表示</h2>
        <div class="field-stack">
          <label>表示名</label>
          <input class="input" value="Gunji Lab Demo">
        </div>
        <div class="field-stack">
          <label>既定の読み方</label>
          <select class="select"><option>さくっと読む</option><option>じっくり読む</option><option>深く読む</option></select>
        </div>
      </article>
      <article class="note-panel">
        <h2>Favorite Tags</h2>
        <div class="tag-row">${tags(favorites.tags)}</div>
      </article>
    </section>
  `;
}

async function render() {
  const { route, id } = routeInfo();
  setActive(route);
  app.innerHTML = `<section class="loading-view"><p>読み込み中...</p></section>`;
  try {
    if (route === "home") await renderHome();
    else if (route === "search") await renderSearch();
    else if (route === "paper") await renderPaper(id);
    else if (route === "notebook") await renderNotebook(id);
    else if (route === "my") await renderMyNotebook();
    else if (route === "lab") await renderLabNotebook();
    else if (route === "trail") await renderTrail(id);
    else if (route === "settings") await renderSettings();
    else location.hash = "home";
  } catch (error) {
    app.innerHTML = `<section class="empty">読み込みに失敗しました: ${escapeHtml(error.message)}</section>`;
  }
  app.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: "smooth" });
}

addEventListener("hashchange", render);
render();
