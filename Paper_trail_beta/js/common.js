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
    const url = window.PAPERTRAIL_CONFIG?.GAS_WEB_APP_URL || "";
    return Boolean(url && !url.includes("PASTE_"));
  }

  function hasAuthToken() {
    return Boolean(window.PaperTrailAuth?.getToken?.());
  }

  function isInsideGasShell() {
    if (!window.parent || window.parent === window) return false;
    return /^https:\/\/[^/]*script\.googleusercontent\.com\//.test(document.referrer || "");
  }

  function getPaperTrailRouteUrl(route, filename) {
    if (isInsideGasShell()) return filename;
    const gasUrl = window.PAPERTRAIL_CONFIG?.GAS_WEB_APP_URL || "";
    if (!gasUrl || gasUrl.includes("PASTE_")) {
      console.warn("[PaperTrail] GAS_WEB_APP_URL is missing.");
      return filename;
    }
    const url = new URL(gasUrl);
    url.searchParams.set("view", "app");
    url.searchParams.set("route", route);
    return url.toString();
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
    if (isInsideGasShell()) return false;
    const gasUrl = window.PAPERTRAIL_CONFIG?.GAS_WEB_APP_URL || "";
    if (!gasUrl || gasUrl.includes("PASTE_")) return false;
    const url = new URL(gasUrl);
    url.searchParams.set("view", "app");
    url.searchParams.set("route", route);
    window.location.replace(url.toString());
    return true;
  }

  function requireAuth(target, message="大学アカウントでログインすると、保存したNotebookが表示されます。") {
    if (isBackendConfigured() && hasAuthToken()) return true;
    if (target) {
      target.innerHTML = `<div class="empty-state"><p>${escapeHtml(message)}</p></div>`;
    }
    return false;
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
    const filename = id ? `notebook.html?notebook=${encodeURIComponent(id)}` : "notebook.html";
    return isInsideGasShell() ? filename : getPaperTrailRouteUrl("new", filename);
  }

  function cardHtml(card, { lab=false }={}) {
    const tags = (card.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
    const snippet = cardHeh(card) || cardWhy(card) || card.wantToKnow || "まだ短いメモはありません";
    const reactions = card.reactions || { like:0, curious:0, useful:0 };
    const meta = [card.journal, card.authors, card.year].filter(Boolean).join(" · ");
    const owner = lab ? `<span class="nickname-badge">${escapeHtml(card.displayName || card.owner || "Lab member")}</span>` : "";
    return `<article class="paper-card card" data-id="${escapeHtml(card.id || "")}">
      <div class="paper-card-top">
        <span class="level-badge">${escapeHtml(cardStage(card))}</span>
        ${owner}
        <small>${escapeHtml(formatDate(card.updatedAt || card.createdAt))}</small>
      </div>
      <h3>${escapeHtml(card.title || "Untitled")}</h3>
      <p class="meta">${escapeHtml(meta || card.doi || "PaperTrail Notebook")}</p>
      <div class="tags">${tags}</div>
      <div class="snippet">${escapeHtml(snippet)}</div>
      <div class="notebook-markers">
        <span>🌱 へぇ！ ${escapeHtml(cardHeh(card) || "未記入")}</span>
        <span>🤔 なんで？ ${escapeHtml(cardWhy(card) || "未記入")}</span>
      </div>
      <div class="card-actions">
        ${lab ? `
          <span class="reaction">👍 ${reactions.like || 0}</span>
          <span class="reaction">📚 ${reactions.curious || 0}</span>
          <span class="reaction">💡 ${reactions.useful || 0}</span>
        ` : `<a class="primary small button-link" href="${notebookUrl(card)}">続きを読む</a>`}
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

  async function loadMyNotebookCards() {
    const response = await window.PaperTrailAPI.listMyNotebooks();
    if (!Array.isArray(response)) {
      throw new Error("Notebook一覧の形式を確認できませんでした。");
    }
    return response.map(notebookItemToCard);
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
