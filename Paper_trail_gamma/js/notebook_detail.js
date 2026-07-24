(() => {
  const { $, escapeHtml, readingLevelLabel, loadMyNotebookCards } = window.PaperTrailCommon;

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function text(value, fallback="まだ記録がありません。") {
    const normalized = Array.isArray(value)
      ? value.filter(Boolean).join("、")
      : String(value || "").trim();
    return normalized ? escapeHtml(normalized) : `<span class="muted">${escapeHtml(fallback)}</span>`;
  }

  function row(label, value, fallback="-") {
    return `<article class="notebook-detail-section">
      <h3>${escapeHtml(label)}</h3>
      <p>${text(value, fallback)}</p>
    </article>`;
  }

  function group(eyebrow, title, rows) {
    const body = rows.filter(Boolean).join("");
    if (!body) return "";
    return `<section class="notebook-detail-body">
      <div class="notebook-detail-title">
        <span class="eyebrow">${escapeHtml(eyebrow)}</span>
        <h2>${escapeHtml(title)}</h2>
      </div>
      ${body}
    </section>`;
  }

  function vocabularyRows(items=[]) {
    if (!items.length) return "";
    return items.map((item, index) =>
      row(`言葉 ${index + 1}`, [item.japanese, item.english, item.note].filter(Boolean).join(" / "))
    ).join("");
  }

  function figureRows(figures=[]) {
    if (!figures.length) return "";
    return figures.map((figure, index) => group(
      "じっくり読む · 結果",
      figure.number || `Figure ${index + 1}`,
      [
        row("重要度", figure.importance),
        row("図の種類", figure.type),
        row("解析手法", figure.analysis),
        row("この図表は何を示している？", figure.summary),
        row("なぜ重要だと思った？", figure.why),
        row("この図表を見て生まれた疑問", figure.question)
      ]
    )).join("");
  }

  function paragraphRows(sectionLabel, paragraphs=[]) {
    if (!paragraphs.length) return "";
    return paragraphs.map((paragraph, index) => group(
      `じっくり読む · ${sectionLabel}`,
      `Paragraph ${index + 1}を読む`,
      [
        row("Topic sentence 原文（一時メモ）", paragraph.original),
        row("日本語訳（一時表示・保存なし）", paragraph.translation),
        row("自分の言葉で段落タイトル", paragraph.title),
        row("この段落の役割", paragraph.role),
        row("自分の言葉で一文にすると？", paragraph.summary),
        row("メモ", paragraph.note)
      ]
    )).join("");
  }

  function citationRows(citations=[]) {
    if (!citations.length) return "";
    return citations.map((citation, index) => group(
      "NEXT TRAIL",
      `気になった論文 ${index + 1}`,
      [
        row("著者", citation.authors),
        row("年", citation.year),
        row("論文タイトル", citation.title),
        row("Journal", citation.journal),
        row("Volume", citation.volume),
        row("Issue", citation.issue),
        row("Pages", citation.pages),
        row("DOI", citation.doi),
        row("なぜ気になった？", citation.reason)
      ]
    )).join("");
  }

  function renderNotebookFromData(card, data) {
    const paper = data.paper || {};
    const quick = data.quick || {};
    const abstractMap = quick.abstractMap || {};
    const reflections = data.reflections || {};
    const careful = reflections.careful || {};
    const deepReflection = reflections.deep || {};
    const methods = data.methods || {};
    const deep = data.deep || {};
    const state = data.state || {};
    const paperTitle = paper.title || card.paperTitle || card.title || "Untitled";

    return `<article class="paper-notebook-detail">
      <header class="paper-notebook-head">
        <span class="eyebrow">PAPER NOTEBOOK</span>
        <h2>${escapeHtml(paperTitle)}</h2>
        <dl class="paper-notebook-meta">
          <div><dt>Authors</dt><dd>${text(paper.authors, "-")}</dd></div>
          <div><dt>Journal</dt><dd>${text(paper.journal, "-")}</dd></div>
          <div><dt>Year</dt><dd>${text(paper.year, "-")}</dd></div>
          <div><dt>DOI</dt><dd>${text(paper.doi, "-")}</dd></div>
        </dl>
        <div class="paper-notebook-tags">
          <span class="level-badge">${escapeHtml(readingLevelLabel(card.readingLevel || state.level))}</span>
        </div>
      </header>

      ${group("LEVEL 1 · PAGE 1", "さくっと読む準備", [
        row("論文タイトル", paper.title),
        row("著者", paper.authors),
        row("雑誌", paper.journal),
        row("出版年", paper.year),
        row("キーワード（日本語）", paper.keywordsJa),
        row("Keywords", paper.keywordsEn),
        row("PDFの状態", paper.pdfStatus),
        row("どうしてこの論文を読もうと思った？", paper.reasons),
        row("読む理由を自分の言葉で書く", paper.reason),
        row("今日の読み方を決める", paper.usePurposes),
        row("この論文をどこで見つけましたか？", paper.discoverySource),
        row("紹介してくれた人", paper.introducedBy),
        row("検索に使ったキーワード", paper.searchKeywords)
      ])}

      ${group("LEVEL 1 · PAGE 2", "Abstractから概要をつかむ", [
        row("背景", abstractMap.background),
        row("課題", abstractMap.gap),
        row("目的", abstractMap.objective),
        row("結果", abstractMap.result),
        row("考察・意味", abstractMap.interpretation),
        row("自分の言葉で要約", quick.summaries)
      ])}

      ${group("LEVEL 2", "じっくり読む", [
        row("結果", state.completed?.results ? "完了" : ""),
        row("背景", state.completed?.background ? "完了" : ""),
        row("考察", state.completed?.discussion ? "完了" : ""),
        row("方法", state.completed?.methods ? "完了" : "")
      ])}

      ${figureRows(state.figures || [])}
      ${paragraphRows("背景", state.paragraphs?.background || [])}
      ${paragraphRows("考察", state.paragraphs?.discussion || [])}
      ${citationRows(state.backgroundCitations || [])}

      ${group("DISCUSSION REFLECTION", "考察全体を振り返る", [
        row("著者は、結果をどのように解釈していた？", state.discussionReflection?.takeaway),
        row("考察を読んで、新しく気になったこと", state.discussionReflection?.question)
      ])}

      ${group("じっくり読む · 方法", "研究の設計を整理する", [
        row("研究対象", methods.subject),
        row("サンプル数", methods.sampleSize),
        row("実験・観察デザイン", methods.design),
        row("測定項目", methods.measurements),
        row("解析手法", methods.analyses),
        row("自分の研究で参考になりそうな点", methods.reference),
        row("分からなかった点", methods.question)
      ])}

      ${group("YOUR TRAIL", "じっくり読んで残ったこと", [
        vocabularyRows(careful.vocabulary || []),
        row("一番気になったことは？", careful.question),
        row("今日の収穫", careful.harvest),
        row("この論文を研究室のみんなにおすすめする？", careful.recommendation?.level),
        row("おすすめポイント", careful.recommendation?.reason)
      ])}

      ${group("LEVEL 3", "深掘りする", [
        row("深掘りしたいこと", deep.focus),
        row("自分の考えたことをまとめてみよう", deep.thinking),
        row("疑問に思っていることをまとめてみよう", deep.questions),
        row("次に確かめたいこと・読んでみたいもの", deep.nextStep),
        row("自分の研究や興味とのつながり", deep.connection)
      ])}

      ${group("YOUR TRAIL", "深掘りして残ったこと", [
        vocabularyRows(deepReflection.vocabulary || []),
        row("一番気になったことは？", deepReflection.question),
        row("今日の収穫", deepReflection.harvest),
        row("この論文を研究室のみんなにおすすめする？", deepReflection.recommendation?.level),
        row("おすすめポイント", deepReflection.recommendation?.reason)
      ])}

    </article>`;
  }

  async function render() {
    const root = $("#notebook-detail-root");
    if (!root) return;
    const id = params().get("notebook") || "";
    const cards = await loadMyNotebookCards();
    const card = cards.find(item => item.id === id || item.notebookId === id) || cards[0];
    const data = card?.notebookJson;
    if (!card || !data) {
      root.innerHTML = `<div class="empty-state"><p>表示できるNotebookがありません。</p><a class="primary button-link" href="my_notebook.html">My Notebookへ戻る</a></div>`;
      return;
    }
    root.innerHTML = renderNotebookFromData(card, data);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
