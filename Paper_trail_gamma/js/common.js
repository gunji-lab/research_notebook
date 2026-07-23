(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function escapeHtml(str="") {
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      "\"":"&quot;",
      "'":"&#039;"
    }[s]));
  }

  function showToast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2400);
  }

  function isBackendConfigured() {
    return false;
  }

  function hasAuthToken() {
    return false;
  }

  function isInsideGasShell() {
    return false;
  }

  function getPaperTrailRouteUrl(route, filename) {
    return filename;
  }

  function initializePaperTrailNavigation() {
    $$("[data-papertrail-route]").forEach(link => {
      const route = link.dataset.papertrailRoute;
      const filename = link.dataset.papertrailFile;
      if (!route || !filename) return;
      link.href = getPaperTrailRouteUrl(route, filename);
    });
  }

  function redirectToGasShellIfNeeded(route) {
    return false;
  }

  function requireAuth(target, message="") {
    return true;
  }

  function formatDate(value) {
    if (!value) return "日付なし";
    return String(value).slice(0, 10);
  }

  function readingLevelLabel(level) {
    const normalized = String(level || "quick").toLowerCase();
    if (normalized.startsWith("deep")) return "🌳 深掘り";
    if (normalized.startsWith("careful")) return "🌿 じっくり";
    return "🌱 さくっと";
  }

  function notebookItemToCard(item) {
    const json = item.notebookJson || {};
    const paper = json.paper || {};
    const quick = json.quick || {};
    const abstractMap = quick.abstractMap || {};
    const reflections = json.reflections || {};
    const careful = reflections.careful || {};
    const deepReflection = reflections.deep || {};
    const deep = json.deep || {};
    const heh = item.shortSummary
      || quick.summaries?.[0]
      || abstractMap.result
      || abstractMap.interpretation
      || deep.thinking
      || "";
    const why = item.question
      || abstractMap.gap
      || careful.question
      || deepReflection.question
      || deep.questions
      || "";

    return {
      id: item.notebookId,
      notebookId: item.notebookId,
      backend: true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      owner: item.displayName || item.nickname || item.studentId || "自分",
      displayName: item.displayName || "",
      nickname: item.nickname || "",
      studentId: item.studentId || "",
      doi: item.doi || paper.doi || "",
      title: item.title || paper.title || "Untitled",
      paperTitle: paper.title || item.paperTitle || item.openAlexTitle || item.title || "",
      englishTitle: item.englishTitle || paper.englishTitle || "",
      openAlexTitle: item.openAlexTitle || paper.openAlexTitle || "",
      authors: item.authors || paper.authors || "",
      journal: item.journal || paper.journal || "",
      year: item.year || paper.year || "",
      tags: [item.keywordsJa || paper.keywordsJa, item.keywordsEn || paper.keywordsEn].filter(Boolean),
      readingMode: readingLevelLabel(item.readingLevel),
      readingLevel: item.readingLevel,
      wantToKnow: paper.reason || "",
      purpose: item.objective || abstractMap.objective || "",
      results: abstractMap.result || "",
      interpretation: abstractMap.interpretation || "",
      gap: item.gap || abstractMap.gap || "",
      relation: deep.connection || "",
      question: why,
      backendHeh: heh,
      backendWhy: why,
      reactions: { like: 0, curious: 0, useful: 0 }
    };
  }

  function cardStage(card) {
    return card.readingMode || readingLevelLabel(card.readingLevel);
  }

  function cardHeh(card) {
    return card.backendHeh || card.interpretation || card.results || card.purpose || "";
  }

  function cardWhy(card) {
    return card.backendWhy || card.question || card.gap || "";
  }

  function roleMatches(card, role) {
    if (!role) return true;
    if (role === "未解明点") return Boolean(card.gap || card.question);
    if (role === "研究目的") return Boolean(card.purpose);
    if (role === "限界") return Boolean(card.gap);
    return JSON.stringify(card).includes(role);
  }

  function searchMatches(card, q) {
    if (!q) return true;
    return JSON.stringify(card).toLowerCase().includes(q.toLowerCase());
  }

  function notebookUrl(card) {
    const id = card.notebookId || card.id || "";
    const filename = id ? `notebook_detail.html?notebook=${encodeURIComponent(id)}` : "notebook.html";
    return isInsideGasShell() ? filename : getPaperTrailRouteUrl("mine", filename);
  }

  function cardHtml(card, { lab=false, variant="paper" }={}) {
    const tags = (card.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
    const reactions = card.reactions || { like:0, curious:0, useful:0 };
    const meta = [card.authors, card.journal, card.year].filter(Boolean).join(" · ");
    const paperTitle = card.paperTitle || card.englishTitle || card.openAlexTitle || card.originalTitle || card.title || "Untitled";
    const firstAuthor = String(card.authors || "").split(";")[0].trim();
    const minimalMeta = [firstAuthor, card.year].filter(Boolean).join(" · ");
    const owner = lab ? `<span class="nickname-badge">${escapeHtml(card.displayName || card.owner || "Lab member")}</span>` : "";
    const href = notebookUrl(card);
    const title = variant === "paper" ? paperTitle : card.title || "Untitled";
    const metaText = variant === "minimal" ? minimalMeta : variant === "paper" ? [card.title, meta].filter(Boolean).join(" · ") : meta;
    const showTags = variant !== "minimal";
    const showStage = variant !== "minimal";
    return `<article class="paper-card card card-${escapeHtml(variant)}" data-id="${escapeHtml(card.id || "")}">
      <div class="paper-card-top">
        ${showStage ? `<span class="level-badge">${escapeHtml(cardStage(card))}</span>` : ""}
        ${owner}
        <small>最終更新 ${escapeHtml(formatDate(card.updatedAt || card.createdAt))}</small>
      </div>
      <a class="paper-card-title" href="${href}">
        <h3>${escapeHtml(title)}</h3>
      </a>
      <p class="meta">${escapeHtml(metaText || card.doi || "PaperTrail Notebook")}</p>
      ${showTags ? `<div class="tags">${tags}</div>` : ""}
      <div class="card-actions">
        ${lab ? `
          <span class="reaction">👍 ${reactions.like || 0}</span>
          <span class="reaction">📚 ${reactions.curious || 0}</span>
          <span class="reaction">💡 ${reactions.useful || 0}</span>
        ` : `<a class="primary small button-link" href="${href}">Notebookを開く</a>`}
      </div>
    </article>`;
  }

  function debugNotebookHtml(debug) {
    if (!debug) return "";
    const recent = (debug.recent || []).map(row =>
      `<li>${escapeHtml(row.studentId || "student_idなし")} / ${escapeHtml(row.title || "Untitled")} / ${escapeHtml((row.updatedAt || "").slice(0, 10))}</li>`
    ).join("");
    return `<details class="debug-note">
      <summary>保存済みなのに表示されない場合の確認情報</summary>
      <dl>
        <div><dt>現在のアカウントID</dt><dd>${escapeHtml(debug.userStudentId || "")}</dd></div>
        <div><dt>Notebooks総数</dt><dd>${Number(debug.totalNotebooks || 0)}</dd></div>
        <div><dt>このアカウントに一致した件数</dt><dd>${Number(debug.matchedNotebooks || 0)}</dd></div>
      </dl>
      ${recent ? `<p>最新の保存:</p><ul>${recent}</ul>` : ""}
    </details>`;
  }

  const mockNotebookCards = [
    {
      id: "mock-circadian-microbiome",
      notebookId: "",
      createdAt: "2026-07-16T09:10:00.000Z",
      updatedAt: "2026-07-19T13:42:00.000Z",
      owner: "自分",
      displayName: "Gunji Lab Demo",
      doi: "10.1000/pt.2025.001",
      title: "体内時計と腸内細菌のノート",
      paperTitle: "Circadian rhythms of hosts and their gut microbiomes: Implications for animal physiology and ecology",
      authors: "Sato, M.; Klein, R.; Fernandez, L.",
      journal: "Ecology Letters",
      year: "2025",
      tags: ["microbiome", "sampling", "time"],
      readingMode: "🌿 じっくり",
      readingLevel: "careful",
      wantToKnow: "採集時刻の扱いについて、方法を中心に読み返したい。",
      purpose: "自分の研究で採集時刻をどう扱うべきか考えるため。",
      results: "同じ個体・同じ環境でも、サンプリング時刻によって見える微生物叢が変わる。",
      interpretation: "宿主と微生物は、時間スケールを共有しながら相互に影響している。",
      gap: "野外調査で時間帯を統制できない場合、どの程度まで解釈に注意が必要か。",
      relation: "行動観察と採集を同じ日に行う計画では、採集順序が結果に影響する可能性がある。",
      question: "日内リズムを見るなら最低何点のサンプリングが必要なのか。",
      backendHeh: "採集時刻そのものが、ただの記録ではなく解釈を左右する変数になる。",
      backendWhy: "時系列設計を入れない野外研究では、どこまで結果を一般化できるのか。",
      reactions: { like: 4, curious: 3, useful: 5 }
    },
    {
      id: "mock-bird-bone",
      notebookId: "",
      createdAt: "2026-07-15T10:30:00.000Z",
      updatedAt: "2026-07-18T08:20:00.000Z",
      owner: "自分",
      displayName: "Gunji Lab Demo",
      doi: "10.1000/pt.2024.014",
      title: "鳥の骨はなぜ軽いのか",
      paperTitle: "Bone density and the lightweight skeletons of birds",
      authors: "Nguyen, T.; Patel, A.; Hoshino, Y.",
      journal: "Journal of Experimental Biology",
      year: "2024",
      tags: ["biomechanics", "figures"],
      readingMode: "🌱 さくっと",
      readingLevel: "quick-complete",
      wantToKnow: "図表から読み直す。Discussionは後でよい。",
      purpose: "鳥の骨が軽いという説明を、密度と構造に分けて理解する。",
      results: "軽量化は単純な低密度ではなく、内部構造と力学的制約のバランスで説明される。",
      interpretation: "飛翔様式によって骨の最適解が違う。",
      gap: "成長段階で内部構造はどのくらい変化するのか。",
      relation: "形態比較をするとき、重量だけでなく構造指標も必要。",
      question: "骨密度と内部構造を分けて評価するには、どの図を最初に見るべきか。",
      backendHeh: "「軽い骨」は密度だけの話ではなく、形と空間の使い方の話でもある。",
      backendWhy: "飛べない鳥では、同じ制約がどう変化するのか。",
      reactions: { like: 2, curious: 5, useful: 2 }
    },
    {
      id: "mock-dandelion",
      notebookId: "",
      createdAt: "2026-07-14T11:00:00.000Z",
      updatedAt: "2026-07-17T12:05:00.000Z",
      owner: "自分",
      displayName: "Gunji Lab Demo",
      doi: "10.1000/pt.2026.007",
      title: "都市のタンポポと種子散布",
      paperTitle: "Reduced seed dispersal potential in dandelions isolated within urban historical sites",
      authors: "Arai, K.; Wilson, J.; Morita, N.",
      journal: "Urban Ecosystems",
      year: "2026",
      tags: ["urban ecology", "plants", "dispersal"],
      readingMode: "🌳 深掘り",
      readingLevel: "deep",
      wantToKnow: "研究テーマに近い。まず仮説と図だけ拾った。",
      purpose: "都市の孤立環境が植物の分散形質に与える影響を理解する。",
      results: "孤立した集団では、風散布に関わる形質が弱まっている可能性がある。",
      interpretation: "都市の歴史的サイトという具体的な景観条件が、形質の解釈に結びついている。",
      gap: "孤立の期間と分散形質の変化をどう推定しているのか。",
      relation: "都市環境の小さな分断を研究テーマにするときの導入として使えそう。",
      question: "分散しないことが有利になる環境条件はどこから生まれるのか。",
      backendHeh: "都市の孤立は、移動しやすい形質そのものを変えるかもしれない。",
      backendWhy: "孤立した場所で分散能力が下がるなら、再接続した時に何が起こるのか。",
      reactions: { like: 5, curious: 4, useful: 3 }
    },
    {
      id: "mock-student-questions",
      notebookId: "",
      createdAt: "2026-07-13T15:30:00.000Z",
      updatedAt: "2026-07-16T09:25:00.000Z",
      owner: "自分",
      displayName: "Gunji Lab Demo",
      doi: "10.1000/pt.2023.032",
      title: "学生の問いが学びを変える",
      paperTitle: "Student-generated questions as drivers of inquiry-based learning",
      authors: "Ishikawa, R.; Miller, S.",
      journal: "Physics Education Research",
      year: "2023",
      tags: ["education", "questions", "ux"],
      readingMode: "🌳 深掘り",
      readingLevel: "deep-complete",
      wantToKnow: "PaperTrailのプロンプト設計に直接使える。",
      purpose: "学生が自分の疑問から読み進めるUXを設計するヒントを得る。",
      results: "質問を書くことは理解確認ではなく、学習の所有感を作る活動として機能している。",
      interpretation: "問いを先に置くことで、学生は説明を受け取る側ではなく探究する側になる。",
      gap: "自由記述を評価対象にしすぎず、どう支援の材料にできるか。",
      relation: "PaperTrailの深掘りテンプレを自由度高めにする根拠になる。",
      question: "評価ではなく読み返しのために問いを保存するUIはどう作れるか。",
      backendHeh: "学生の疑問は、理解不足ではなく研究の入口として扱える。",
      backendWhy: "問いを書くことが苦手な学生には、どこまで足場を用意するとよいのか。",
      reactions: { like: 3, curious: 6, useful: 6 }
    }
  ];

  async function loadMyNotebookCards() {
    try {
      const localStore = window.PaperTrailLocalStore;
      const localNotebooks = localStore?.loadNotebooks ? await localStore.loadNotebooks() : [];
      const localCards = (localNotebooks || []).map(item => notebookItemToCard({
        ...item,
        notebookId: item.notebookId || item.paperId,
        title: item.title || item.notebookJson?.paper?.title || "Untitled"
      }));
      if (localCards.length) {
        return localCards.map(card => ({ ...card, backend: false, local: true }));
      }
    } catch (error) {
      console.error("PaperTrail IndexedDB load failed", error);
    }
    return mockNotebookCards.map(card => ({ ...card, backend: false }));
  }

  window.PaperTrailCommon = {
    $,
    $$,
    escapeHtml,
    showToast,
    isBackendConfigured,
    hasAuthToken,
    isInsideGasShell,
    getPaperTrailRouteUrl,
    initializePaperTrailNavigation,
    redirectToGasShellIfNeeded,
    requireAuth,
    formatDate,
    readingLevelLabel,
    notebookItemToCard,
    cardStage,
    cardHeh,
    cardWhy,
    roleMatches,
    searchMatches,
    notebookUrl,
    cardHtml,
    debugNotebookHtml,
    loadMyNotebookCards
  };

  document.addEventListener("DOMContentLoaded", initializePaperTrailNavigation);
})();
