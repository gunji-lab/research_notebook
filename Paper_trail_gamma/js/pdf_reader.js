(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const DOI_RE = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/ig;
  const state = {
    pdf: null,
    file: null,
    hash: "",
    page: 1,
    pages: 1,
    scale: 1.18,
    selectedText: "",
    entries: [],
    paperId: ""
  };

  function escapeHtml(value="") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function uuid() {
    return crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function cleanDoi(value="") {
    return String(value)
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
      .replace(/^doi:\s*/i, "")
      .replace(/[)\].,;:]+$/g, "")
      .trim();
  }

  function currentDoi() {
    return cleanDoi($("#doi")?.value || "");
  }

  function currentPaperTitle() {
    return ($("#title")?.value || "").trim();
  }

  function paperFingerprint() {
    const doi = currentDoi();
    if (doi) return `doi:${doi.toLowerCase()}`;
    const title = currentPaperTitle();
    const authors = ($("#authors")?.value || "").trim();
    const year = ($("#year")?.value || "").trim();
    if (title && authors && year) return `meta:${[title, authors, year].join("|").toLowerCase()}`;
    return state.hash ? `pdf:${state.hash}` : "paper:unspecified";
  }

  async function sha256(buffer) {
    if (!crypto.subtle) return "";
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function setStatus(text) {
    const status = $("#pdfFileStatus");
    if (status) status.textContent = text;
  }

  function setDoiStatus(text) {
    const status = $("#pdfDoiStatus");
    if (status) status.textContent = text;
  }

  function detectDoiFromText(text="") {
    const candidates = [];
    let match;
    while ((match = DOI_RE.exec(text)) !== null) {
      const doi = cleanDoi(match[0]);
      if (!candidates.includes(doi)) candidates.push(doi);
    }
    return candidates;
  }

  async function extractDoi(pdf) {
    const limit = Math.min(pdf.numPages, 3);
    for (let pageNumber = 1; pageNumber <= limit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(" ");
      const candidates = detectDoiFromText(text);
      if (candidates.length) return { doi: candidates[0], candidates, page: pageNumber };
    }
    return { doi: "", candidates: [], page: 0 };
  }

  function configurePdfJs() {
    if (!window.pdfjsLib) return false;
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    return true;
  }

  async function renderPage(pageNumber=state.page) {
    if (!state.pdf) return;
    updateWorkspaceState();
    state.page = Math.min(Math.max(1, pageNumber), state.pages);
    const page = await state.pdf.getPage(state.page);
    const viewport = page.getViewport({ scale: state.scale });
    const canvas = $("#pdfCanvas");
    const textLayer = $("#pdfTextLayer");
    if (!canvas || !textLayer) return;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;
    textLayer.style.setProperty("--scale-factor", `${state.scale}`);
    textLayer.innerHTML = "";
    await page.render({ canvasContext: context, viewport }).promise;
    await renderTextLayer(page, viewport, textLayer);
    const wrap = $("#pdfCanvasWrap");
    if (wrap) {
      wrap.scrollLeft = 0;
      wrap.scrollTop = 0;
    }

    $("#pdfPageNumber").textContent = String(state.page);
    $("#pdfPageCount").textContent = String(state.pages);
    await saveReadingState();
    renderQuotes();
  }

  async function renderTextLayer(page, viewport, container) {
    const textContent = await page.getTextContent();
    container.innerHTML = "";
    container.classList.add("textLayer");
    if (window.pdfjsLib?.renderTextLayer) {
      const task = window.pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container,
        viewport,
        textDivs: [],
        enhanceTextSelection: true
      });
      await task.promise;
      return;
    }

    textContent.items.forEach(item => {
      const span = document.createElement("span");
      const tx = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
      span.textContent = item.str;
      span.style.left = `${tx[4]}px`;
      span.style.top = `${tx[5] - Math.abs(tx[3])}px`;
      span.style.fontSize = `${Math.max(8, Math.abs(tx[3]))}px`;
      span.style.transform = `scaleX(${Math.max(.7, item.width ? (tx[0] / item.width) : 1)})`;
      container.appendChild(span);
    });
  }

  function updateWorkspaceState() {
    const panel = $("#pdfViewerPanel");
    if (!panel) return;
    panel.hidden = false;
    panel.classList.toggle("has-pdf", Boolean(state.pdf));
    const empty = $("#pdfWorkspaceEmpty");
    if (empty) empty.hidden = Boolean(state.pdf);
  }

  async function loadExistingLocalData() {
    state.paperId = paperFingerprint();
    const store = window.PaperTrailLocalStore;
    if (!store) return;
    const entries = await store.loadNotebookEntries(state.paperId);
    state.entries = entries.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const previous = await store.loadReadingState(state.paperId);
    if (previous?.page) state.page = Number(previous.page) || 1;
    const notice = $("#pdfRestoreNotice");
    if (notice && (state.entries.length || previous)) {
      notice.hidden = false;
      notice.textContent = state.entries.length
        ? `前回のメモを${state.entries.length}件読み込みました。`
        : "前回の読書位置を読み込みました。";
    }
  }

  async function savePaper() {
    const store = window.PaperTrailLocalStore;
    if (!store) return;
    state.paperId = paperFingerprint();
    await store.savePaper({
      id: state.paperId,
      doi: currentDoi(),
      title: currentPaperTitle(),
      authors: ($("#authors")?.value || "").trim(),
      year: ($("#year")?.value || "").trim(),
      pdfHash: state.hash,
      pdfFileName: state.file?.name || "",
      createdAt: new Date().toISOString()
    });
  }

  async function saveReadingState() {
    const store = window.PaperTrailLocalStore;
    if (!store || !state.paperId) return;
    await store.saveReadingState({
      paperId: state.paperId,
      doi: currentDoi(),
      pdfHash: state.hash,
      page: state.page,
      readingMode: document.querySelector(".rn-page.active")?.id || "",
      updatedAt: new Date().toISOString()
    });
  }

  async function handlePdfFile(file) {
    if (!file || file.type !== "application/pdf") {
      setStatus("PDFファイルを選択してください。");
      return;
    }
    if (!configurePdfJs()) {
      setStatus("PDF.jsを読み込めませんでした。ネットワーク接続を確認してください。");
      return;
    }
    state.file = file;
    setStatus(`${file.name} を読み込み中…`);
    const buffer = await file.arrayBuffer();
    state.hash = await sha256(buffer);
    try {
      state.pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
      state.pages = state.pdf.numPages;
      state.page = 1;
      $("#pdfClearButton").hidden = false;
      setStatus(`${file.name}（${state.pages}ページ）`);
      const detected = await extractDoi(state.pdf);
      if (detected.doi) {
        const doiInput = $("#doi");
        if (doiInput && !doiInput.value.trim()) {
          doiInput.value = detected.doi;
          doiInput.dispatchEvent(new Event("input", { bubbles: true }));
          setDoiStatus(`PDF ${detected.page}ページ目からDOI候補を入力しました。必要なら修正できます。`);
        } else {
          setDoiStatus(`PDFからDOI候補 ${detected.doi} を見つけました。`);
        }
      } else {
        setDoiStatus("DOIを自動で見つけられませんでした。分かる場合は入力してください。");
      }
      await savePaper();
      await loadExistingLocalData();
      updateWorkspaceState();
      await renderPage(state.page);
    } catch (error) {
      console.error(error);
      setStatus("PDFを読み込めませんでした。別のPDFで試してください。");
    }
  }

  function currentSection() {
    const active = document.querySelector(".rn-page.active")?.id || "";
    if (active.includes("background")) return "background";
    if (active.includes("discussion")) return "discussion";
    if (active.includes("method")) return "methods";
    if (active.includes("deep")) return "deep";
    if (active.includes("figure") || active.includes("results")) return "results";
    return "quick";
  }

  async function createQuote({ translation="" }={}) {
    if (!state.selectedText.trim()) return;
    await savePaper();
    const now = new Date().toISOString();
    const entry = {
      id: uuid(),
      paperId: state.paperId || paperFingerprint(),
      doi: currentDoi(),
      pdfHash: state.hash,
      page: state.page,
      quote: state.selectedText.trim(),
      translation,
      note: "",
      readingMode: document.querySelector(".rn-page.active")?.id || "",
      section: currentSection(),
      paragraphIndex: window.PaperTrailNotebookState?.paragraphIndex || null,
      visibility: "private",
      order: state.entries.length,
      createdAt: now,
      updatedAt: now
    };
    state.entries.push(entry);
    if (window.PaperTrailLocalStore) await window.PaperTrailLocalStore.saveNotebookEntry(entry);
    renderQuotes();
  }

  function renderQuotes() {
    const box = $("#pdfQuoteList");
    if (!box) return;
    const pageEntries = state.entries.filter(entry => Number(entry.page) === Number(state.page));
    const otherCount = state.entries.length - pageEntries.length;
    if (!state.entries.length) {
      box.innerHTML = '<p class="pdf-empty-note">PDF本文を選択すると、引用としてNotebookに残せます。</p>';
      return;
    }
    box.innerHTML = `
      ${otherCount ? `<p class="pdf-page-marker">他のページに${otherCount}件の引用があります。</p>` : ""}
      ${state.entries.map(entry => `
        <article class="pdf-quote-card" data-entry-id="${escapeHtml(entry.id)}">
          <button type="button" class="pdf-page-jump" data-page="${Number(entry.page)}">p.${Number(entry.page)}</button>
          <p>${escapeHtml(entry.quote)}</p>
          ${entry.translation ? `<small>${escapeHtml(entry.translation)}</small>` : ""}
          <textarea data-entry-note="${escapeHtml(entry.id)}" rows="2" placeholder="自分のメモ">${escapeHtml(entry.note || "")}</textarea>
        </article>
      `).join("")}`;
    $$(".pdf-page-jump", box).forEach(button => {
      button.addEventListener("click", () => {
        renderPage(Number(button.dataset.page));
      });
    });
    $$("[data-entry-note]", box).forEach(textarea => {
      textarea.addEventListener("input", async () => {
        const entry = state.entries.find(item => item.id === textarea.dataset.entryNote);
        if (!entry) return;
        entry.note = textarea.value;
        entry.updatedAt = new Date().toISOString();
        if (window.PaperTrailLocalStore) await window.PaperTrailLocalStore.saveNotebookEntry(entry);
      });
    });
  }

  async function translateSelectedText(text) {
    return `［翻訳デモ］${text.slice(0, 180)}${text.length > 180 ? "..." : ""}`;
  }

  function showTranslation(original, translation) {
    const panel = $("#pdfTranslationPanel");
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = `
      <strong>翻訳デモ</strong>
      <p class="pdf-original">${escapeHtml(original)}</p>
      <p>${escapeHtml(translation)}</p>
      <button type="button" class="secondary small" id="pdfQuoteWithTranslation">Notebookへ入れる</button>
    `;
    $("#pdfQuoteWithTranslation")?.addEventListener("click", () => createQuote({ translation }));
  }

  function bindSelectionMenu() {
    const textLayer = $("#pdfTextLayer");
    const menu = $("#pdfSelectionMenu");
    if (!textLayer || !menu) return;
    textLayer.addEventListener("mouseup", () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";
      if (!text) {
        menu.hidden = true;
        return;
      }
      state.selectedText = text;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const host = $("#pdfCanvasWrap").getBoundingClientRect();
      menu.style.left = `${Math.max(8, rect.left - host.left)}px`;
      menu.style.top = `${Math.max(8, rect.top - host.top - 44)}px`;
      menu.hidden = false;
    });
  }

  function bindEvents() {
    $("#pdfSelectButton")?.addEventListener("click", () => $("#pdfFileInput")?.click());
    $("#pdfFileInput")?.addEventListener("change", event => handlePdfFile(event.target.files?.[0]));
    $("#pdfClearButton")?.addEventListener("click", () => {
      state.pdf = null;
      state.file = null;
      state.hash = "";
      state.entries = [];
      $("#pdfFileInput").value = "";
      $("#pdfClearButton").hidden = true;
      $("#pdfCanvas")?.getContext("2d")?.clearRect(0, 0, $("#pdfCanvas").width, $("#pdfCanvas").height);
      $("#pdfTextLayer").innerHTML = "";
      $("#pdfPageNumber").textContent = "-";
      $("#pdfPageCount").textContent = "-";
      updateWorkspaceState();
      setStatus("PDFを解除しました。");
      setDoiStatus("");
      renderQuotes();
    });
    $("#openPdfForCareful")?.addEventListener("click", () => $("#pdfViewerPanel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    $("#openPdfForDeep")?.addEventListener("click", () => $("#pdfViewerPanel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    $("#pdfPrevPage")?.addEventListener("click", () => renderPage(state.page - 1));
    $("#pdfNextPage")?.addEventListener("click", () => renderPage(state.page + 1));
    $("#pdfZoomOut")?.addEventListener("click", () => {
      state.scale = Math.max(.75, state.scale - .15);
      renderPage();
    });
    $("#pdfZoomIn")?.addEventListener("click", () => {
      state.scale = Math.min(2.2, state.scale + .15);
      renderPage();
    });
    $("#pdfQuoteSelection")?.addEventListener("click", () => createQuote());
    $("#pdfCopySelection")?.addEventListener("click", () => navigator.clipboard?.writeText(state.selectedText));
    $("#pdfTranslateSelection")?.addEventListener("click", async () => {
      const translation = await translateSelectedText(state.selectedText);
      showTranslation(state.selectedText, translation);
    });

    const dropZone = $("#pdfDropZone");
    if (dropZone) {
      ["dragenter", "dragover"].forEach(name => dropZone.addEventListener(name, event => {
        event.preventDefault();
        dropZone.classList.add("dragging");
      }));
      ["dragleave", "drop"].forEach(name => dropZone.addEventListener(name, event => {
        event.preventDefault();
        dropZone.classList.remove("dragging");
      }));
      dropZone.addEventListener("drop", event => handlePdfFile(event.dataTransfer?.files?.[0]));
    }
    ["doi", "title", "authors", "year"].forEach(id => {
      $("#" + id)?.addEventListener("input", () => {
        state.paperId = paperFingerprint();
        savePaper();
      });
    });
    bindSelectionMenu();
    updateWorkspaceState();
    renderQuotes();
  }

  document.addEventListener("DOMContentLoaded", bindEvents);
  window.PaperTrailPdf = { renderPage, translateSelectedText };
})();
