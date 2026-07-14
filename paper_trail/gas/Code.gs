/**
 * Research Notebook / Research Starter
 * Google Apps Script backend scaffold
 *
 * 1) 新しいスプレッドシートに紐づくApps Scriptへ貼り付け
 * 2) setupSheets() を一度実行
 * 3) Webアプリとして大学ドメイン内に公開
 *
 * 注意:
 * このプロトタイプのHTMLはlocalStorage版です。
 * 本番接続時は、saveNotebookCard / saveStarterRecord を
 * google.script.run から呼び出すGASホスト版へ切り替えます。
 */

const CONFIG = {
  allowedDomain: 'toyo.jp',
  notebookSheet: 'NotebookCards',
  starterSheet: 'StarterRecords',
  reactionSheet: 'Reactions',
  commentSheet: 'Comments'
};

function setupSheets() {
  const ss = SpreadsheetApp.getActive();
  ensureSheet_(ss, CONFIG.notebookSheet, [
    'record_id','timestamp','user_email','doi','title','authors','journal','year',
    'tags_json','reason_type','want_to_know','reading_mode','paragraphs_json',
    'figures_json','purpose','methods','results','interpretation','gap','relation',
    'next_papers_json','question'
  ]);
  ensureSheet_(ss, CONFIG.starterSheet, [
    'record_id','timestamp','user_email','themes_json','focus_theme','why_attracted',
    'self_relation','doubt_part','success_image','interesting_json','boring_json',
    'questions_json','selected_question','needed_data','next_search'
  ]);
  ensureSheet_(ss, CONFIG.reactionSheet, [
    'timestamp','user_email','record_id','reaction_type'
  ]);
  ensureSheet_(ss, CONFIG.commentSheet, [
    'timestamp','user_email','record_id','comment'
  ]);
}

function getCurrentUser_() {
  const email = Session.getActiveUser().getEmail();
  if (!email || !email.toLowerCase().endsWith('@' + CONFIG.allowedDomain)) {
    throw new Error('大学アカウントでログインしてください。');
  }
  return email.toLowerCase();
}

function saveNotebookCard(card) {
  const email = getCurrentUser_();
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.notebookSheet);
  if (!sh) throw new Error('setupSheets()を実行してください。');

  // 原文・翻訳文の一時メモは受け取らず、保存もしない。
  const safe = {
    record_id: card.id || Utilities.getUuid(),
    timestamp: new Date(),
    user_email: email,
    doi: card.doi || '',
    title: card.title || '',
    authors: card.authors || '',
    journal: card.journal || '',
    year: card.year || '',
    tags_json: JSON.stringify(card.tags || []),
    reason_type: card.reasonType || '',
    want_to_know: card.wantToKnow || '',
    reading_mode: card.readingMode || '',
    paragraphs_json: JSON.stringify(card.paragraphs || []),
    figures_json: JSON.stringify(card.figures || []),
    purpose: card.purpose || '',
    methods: card.methods || '',
    results: card.results || '',
    interpretation: card.interpretation || '',
    gap: card.gap || '',
    relation: card.relation || '',
    next_papers_json: JSON.stringify(card.nextPapers || []),
    question: card.question || ''
  };
  appendObject_(sh, safe);
  return {ok:true, id:safe.record_id};
}

function saveStarterRecord(record) {
  const email = getCurrentUser_();
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.starterSheet);
  if (!sh) throw new Error('setupSheets()を実行してください。');
  const safe = {
    record_id: record.id || Utilities.getUuid(),
    timestamp: new Date(),
    user_email: email,
    themes_json: JSON.stringify(record.themes || []),
    focus_theme: record.focusTheme || '',
    why_attracted: record.whyAttracted || '',
    self_relation: record.selfRelation || '',
    doubt_part: record.doubtPart || '',
    success_image: record.successImage || '',
    interesting_json: JSON.stringify(record.interesting || []),
    boring_json: JSON.stringify(record.boring || []),
    questions_json: JSON.stringify(record.questions || []),
    selected_question: record.selectedQuestion || '',
    needed_data: record.neededData || '',
    next_search: record.nextSearch || ''
  };
  appendObject_(sh, safe);
  return {ok:true, id:safe.record_id};
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function appendObject_(sh, obj) {
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  sh.appendRow(headers.map(h => obj[h] ?? ''));
}
