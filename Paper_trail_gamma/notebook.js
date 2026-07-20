const requestedNotebookId="";
let currentNotebookId="";
let deepReturnPage="page-quick-complete";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];


const state={
  level:"quick",
  completed:{results:false,background:false,discussion:false,methods:false},
  figures:[],
  figureIndex:0,
  paragraphs:{background:[],discussion:[]},
  paragraphSection:"background",
  paragraphIndex:0,
  sectionSummaries:{background:"",discussion:""},
  backgroundCitations:[],
  discussionReflection:{takeaway:"",question:""}
};
window.PaperTrailNotebookState=state;

function notebookPageIds(){
  return new Set($$(".rn-page").map(page=>page.id));
}
function isAuthHash(){
  return location.hash.replace(/^#/,"").startsWith("auth=");
}
function notebookHashPage(){
  try{
    const id=decodeURIComponent(location.hash.replace(/^#/,""));
    return notebookPageIds().has(id) ? id : "";
  }catch{
    return "";
  }
}
function setNotebookHash(id,replace=false){
  if(!notebookPageIds().has(id))return;
  const nextHash=`#${encodeURIComponent(id)}`;
  if(location.hash===nextHash)return;
  const method=replace ? "replaceState" : "pushState";
  history[method](null,"",nextHash);
}
let currentPageId="";
function syncWorkspaceMode(id){
  const main=$(".rn-main");
  if(!main)return;
  main.classList.toggle("quick-workspace-off", id.startsWith("page-quick"));
}
function show(id,{updateHash=true,replaceHash=false,scroll=true}={}){
  if(!notebookPageIds().has(id))return;
  $$(".rn-page").forEach(p=>p.classList.toggle("active",p.id===id));
  currentPageId=id;
  syncWorkspaceMode(id);
  if(updateHash)setNotebookHash(id,replaceHash);
  if(!scroll)return;
  const policy=$(".rn-policy");
  const top=policy
    ? policy.getBoundingClientRect().bottom+window.scrollY+12
    : 180;
  window.scrollTo({top,behavior:"smooth"});
}
syncWorkspaceMode($(".rn-page.active")?.id || "page-quick-basic");
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.open)));
window.addEventListener("hashchange",()=>{
  const page=notebookHashPage();
  if(page&&page!==currentPageId)show(page,{updateHash:false});
});

function addSummary(value=""){
  const list=$("#abstractSummaryList");
  if(!list)return;
  const row=document.createElement("div");
  row.className="summary-row";
  row.innerHTML='<input class="abstract-summary" placeholder="自分の言葉で要約"><button type="button" class="icon-button">×</button>';
  $(".abstract-summary",row).value=value;
  $("button",row).addEventListener("click",()=>row.remove());
  list.appendChild(row);
}
addSummary();addSummary();addSummary();
$("#addAbstractSummary")?.addEventListener("click",()=>addSummary());

function addStageVocabularyRow(stage,japanese="",english="",note=""){
  const list=$("#"+stage+"VocabularyList");
  if(!list)return;
  const row=document.createElement("div");
  row.className="vocabulary-row";
  row.innerHTML=`
    <input class="vocab-ja" placeholder="日本語" value="${escapeHtml(japanese)}">
    <input class="vocab-en" placeholder="English" value="${escapeHtml(english)}">
    <input class="vocab-note" placeholder="短いメモ（任意）" value="${escapeHtml(note)}">
    <button type="button" class="icon-button" aria-label="削除">×</button>`;
  $("button",row).addEventListener("click",()=>{row.remove();save()});
  list.appendChild(row);
}
$("#addCarefulVocabulary")?.addEventListener("click",()=>addStageVocabularyRow("careful"));
$("#addDeepVocabulary")?.addEventListener("click",()=>addStageVocabularyRow("deep"));
addStageVocabularyRow("careful");
addStageVocabularyRow("deep");


$("#translateAbstract").addEventListener("click",()=>{
  $("#abstractTranslation").placeholder="ここに翻訳結果を表示します。翻訳文は保存されません。";
  alert("翻訳APIは未接続です。UI確認用のデモです。");
});

$("#finishQuick").addEventListener("click",()=>{
  state.level="quick-complete";
  $("#map-careful").classList.remove("locked");
  $("#map-deep").classList.remove("locked");
  save();
  show("page-quick-complete");
});
$("#startCareful").addEventListener("click",()=>{
  state.level="careful";
  $("#map-careful").classList.remove("locked");
  save();
  show("page-careful-overview");
});

async function saveAndFinish(level){
  state.level=level;
  save();
  location.href="my_notebook.html";
}

$("#finishQuickNotebook")?.addEventListener("click",async()=>{
  await saveAndFinish("quick-complete");
});

function buildFigureMap(){
  const n=Math.max(1,Number($("#figureCount").value||1));
  const box=$("#figureMapList");box.innerHTML="";
  state.figures=Array.from({length:n},(_,i)=>state.figures[i]||{
    number:`Figure ${i+1}`,importance:"3",type:"散布図",analysis:"",summary:"",why:"",question:""
  });
  state.figures.forEach((f,i)=>{
    const row=document.createElement("div");
    row.className="compact-row";
    row.innerHTML=`<input data-fig-map="${i}" value="${f.number}"><span>未整理</span>`;
    box.appendChild(row);
  });
}
$("#buildFigureMap").addEventListener("click",buildFigureMap);
buildFigureMap();

$("#startFigureReading").addEventListener("click",()=>{
  $$("[data-fig-map]").forEach(inp=>{state.figures[Number(inp.dataset.figMap)].number=inp.value});
  state.figureIndex=0;loadFigure();show("figure-reader");
});
function loadFigure(){
  const f=state.figures[state.figureIndex];
  $("#figureReaderTitle").textContent=`${f.number}を読む`;
  $("#figNumber").value=f.number;$("#figImportance").value=f.importance;
  $("#figType").value=f.type;$("#figAnalysis").value=f.analysis;
  $("#figSummary").value=f.summary;$("#figWhy").value=f.why;$("#figQuestion").value=f.question;
  $("#prevFigure").disabled=state.figureIndex===0;
  $("#saveFigureNext").textContent=state.figureIndex===state.figures.length-1?"結果を保存して戻る":"保存して次へ →";
}
function storeFigure(){
  const f=state.figures[state.figureIndex];
  f.number=$("#figNumber").value;f.importance=$("#figImportance").value;f.type=$("#figType").value;
  f.analysis=$("#figAnalysis").value;f.summary=$("#figSummary").value;f.why=$("#figWhy").value;f.question=$("#figQuestion").value;
}
$("#prevFigure").addEventListener("click",()=>{storeFigure();state.figureIndex--;loadFigure()});
$("#saveFigureNext").addEventListener("click",()=>{
  storeFigure();
  if(state.figureIndex<state.figures.length-1){state.figureIndex++;loadFigure()}
  else{markComplete("results");save();show("page-careful-overview")}
});

const bgRoles=["一般背景","先行研究","研究対象の説明","既知の事実","未解明点","研究目的","仮説","その他"];
const discRoles=["主要結果の解釈","先行研究との比較","メカニズムの説明","予想外の結果","研究の意義","限界","今後の課題","結論","その他"];

function buildOverview(section){
  const count=Math.max(1,Number($("#"+section+"Count").value||1));
  const box=$("#"+section+"OverviewList");box.innerHTML="";
  state.paragraphs[section]=Array.from({length:count},(_,i)=>state.paragraphs[section][i]||{
    original:"",translation:"",title:"",role:(section==="background"?bgRoles[0]:discRoles[0]),summary:"",note:""
  });
  state.paragraphs[section].forEach((p,i)=>{
    const item=document.createElement("article");
    item.className="overview-item";
    item.innerHTML=`<strong>Paragraph ${i+1}</strong>
      <label>Topic sentence 原文（一時メモ）<textarea data-original="${section}-${i}" rows="2">${p.original}</textarea></label>
      <label>日本語訳（一時表示・保存なし）<textarea data-translation="${section}-${i}" rows="2">${p.translation}</textarea></label>`;
    box.appendChild(item);
  });
}
$("#buildBackgroundOverview").addEventListener("click",()=>buildOverview("background"));
$("#buildDiscussionOverview").addEventListener("click",()=>buildOverview("discussion"));
buildOverview("background");buildOverview("discussion");

function translateAll(section){
  $$(`[data-translation^="${section}-"]`).forEach(t=>{if(!t.value)t.placeholder="ここに翻訳結果を表示します（デモ）"});
  alert("翻訳APIは未接続です。全段落翻訳UIの確認用デモです。");
}
$("#translateBackgroundAll").addEventListener("click",()=>translateAll("background"));
$("#translateDiscussionAll").addEventListener("click",()=>translateAll("discussion"));

function syncOverview(section){
  $$(`[data-original^="${section}-"]`).forEach(t=>{
    const i=Number(t.dataset.original.split("-")[1]);state.paragraphs[section][i].original=t.value;
  });
  $$(`[data-translation^="${section}-"]`).forEach(t=>{
    const i=Number(t.dataset.translation.split("-")[1]);state.paragraphs[section][i].translation=t.value;
  });
}
$("#startBackgroundReading").addEventListener("click",()=>{syncOverview("background");startParagraphs("background")});
$("#startDiscussionReading").addEventListener("click",()=>{syncOverview("discussion");startParagraphs("discussion")});

function startParagraphs(section){
  state.paragraphSection=section;state.paragraphIndex=0;loadParagraph();show("paragraph-reader");
}
function scrollToParagraphReader(){
  const page=$("#paragraph-reader");
  if(!page)return;
  const top=page.getBoundingClientRect().top+window.scrollY+70;
  window.scrollTo({top,behavior:"smooth"});
}
function loadParagraph(){
  const section=state.paragraphSection,p=state.paragraphs[section][state.paragraphIndex];
  $("#paragraphSectionLabel").textContent=`じっくり読む · ${section==="background"?"背景":"考察"}`;
  $("#paragraphReaderTitle").textContent=`Paragraph ${state.paragraphIndex+1}を読む`;
  $("#paragraphOriginal").value=p.original;$("#paragraphTranslation").value=p.translation;
  $("#paragraphTitle").value=p.title;$("#paragraphSummary").value=p.summary;$("#paragraphNote").value=p.note;
  const roles=section==="background"?bgRoles:discRoles;
  $("#paragraphRole").innerHTML=roles.map(r=>`<option>${r}</option>`).join("");
  $("#paragraphRole").value=p.role;
  $("#prevParagraph").textContent="← ひとつ戻る";
  $("#saveParagraphNext").textContent=state.paragraphIndex===state.paragraphs[section].length-1?"保存して全体をまとめる":"保存して次へ →";
}
function storeParagraph(){
  const p=state.paragraphs[state.paragraphSection][state.paragraphIndex];
  p.title=$("#paragraphTitle").value;p.role=$("#paragraphRole").value;p.summary=$("#paragraphSummary").value;p.note=$("#paragraphNote").value;
}
$("#prevParagraph").addEventListener("click",()=>{
  storeParagraph();
  if(state.paragraphIndex>0){
    state.paragraphIndex--;
    loadParagraph();
    scrollToParagraphReader();
  }else{
    show(state.paragraphSection==="background"?"background-overview":"discussion-overview");
  }
});
$("#saveParagraphNext").addEventListener("click",()=>{
  storeParagraph();
  if(state.paragraphIndex<state.paragraphs[state.paragraphSection].length-1){
    state.paragraphIndex++;
    loadParagraph();
    scrollToParagraphReader();
  }
  else{loadSectionSummary();show("section-summary-page")}
});
function loadSectionSummary(){
  const s=state.paragraphSection;
  const isBackground=s==="background";

  $("#summarySectionLabel").textContent=isBackground?"BACKGROUND REFLECTION":"DISCUSSION REFLECTION";
  $("#summarySectionTitle").textContent=isBackground?"背景から、次の論文へつなげる":"考察全体を振り返る";
  $("#summarySectionLead").textContent=isBackground
    ?"段落の流れを見直しながら、背景で気になった引用文献を記録します。"
    :"段落の流れを見直しながら、著者の解釈と自分の疑問を整理します。";

  $("#roleFlow").innerHTML=state.paragraphs[s]
    .map(p=>`<span>${escapeHtml(p.role||"未設定")}</span>`).join('<b>→</b>');

  $("#titleFlow").innerHTML=state.paragraphs[s]
    .map((p,i)=>`<article><small>Paragraph ${i+1}</small><strong>${escapeHtml(p.title||"タイトル未入力")}</strong></article>`).join("");

  $("#backgroundReflection").hidden=!isBackground;
  $("#discussionReflection").hidden=isBackground;

  if(isBackground){
    renderCitationCandidates();
  }else{
    $("#discussionTakeaway").value=state.discussionReflection.takeaway||"";
    $("#discussionQuestion").value=state.discussionReflection.question||"";
  }
}

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function addCitationCandidate(data={}){
  state.backgroundCitations.push({
    authors:data.authors||"",
    year:data.year||"",
    title:data.title||"",
    journal:data.journal||"",
    volume:data.volume||"",
    issue:data.issue||"",
    pages:data.pages||"",
    doi:data.doi||"",
    reason:data.reason||"",
    openalexId:data.openalexId||"",
    isOa:Boolean(data.isOa),
    oaUrl:data.oaUrl||"",
    pdfUrl:data.pdfUrl||""
  });
  renderCitationCandidates();
}

function readCitationCandidate(root){
  return {
    authors:$(".citation-authors",root).value,
    year:$(".citation-year",root).value,
    title:$(".citation-title",root).value,
    journal:$(".citation-journal",root).value,
    volume:$(".citation-volume",root).value,
    issue:$(".citation-issue",root).value,
    pages:$(".citation-pages",root).value,
    doi:$(".citation-doi",root).value,
    reason:$(".citation-reason",root).value,
    openalexId:root.dataset.openalexId||"",
    isOa:root.dataset.isOa==="true",
    oaUrl:root.dataset.oaUrl||"",
    pdfUrl:root.dataset.pdfUrl||""
  };
}

function syncCitationCandidates(){
  state.backgroundCitations=$$(".citation-candidate").map(readCitationCandidate);
}

function renderCitationCandidates(){
  const box=$("#citationCandidateList");
  if(!box)return;
  box.innerHTML="";

  if(!state.backgroundCitations.length){
    box.innerHTML='<p class="empty-citation">気になった論文がなければ、追加しなくても大丈夫です。</p>';
    return;
  }

  state.backgroundCitations.forEach((data,index)=>{
    const node=$("#citationCandidateTemplate").content.cloneNode(true);
    const root=$(".citation-candidate",node);

    $(".citation-authors",root).value=data.authors||"";
    $(".citation-year",root).value=data.year||"";
    $(".citation-title",root).value=data.title||"";
    $(".citation-journal",root).value=data.journal||"";
    $(".citation-volume",root).value=data.volume||"";
    $(".citation-issue",root).value=data.issue||"";
    $(".citation-pages",root).value=data.pages||"";
    $(".citation-doi",root).value=data.doi||"";
    $(".citation-reason",root).value=data.reason||"";
    root.dataset.openalexId=data.openalexId||"";
    root.dataset.isOa=String(Boolean(data.isOa));
    root.dataset.oaUrl=data.oaUrl||"";
    root.dataset.pdfUrl=data.pdfUrl||"";

    $(".remove-citation",root).addEventListener("click",()=>{
      syncCitationCandidates();
      state.backgroundCitations.splice(index,1);
      renderCitationCandidates();
    });

    bindOpenAlexCitationButtons(root);

    $(".citation-register",root).addEventListener("click",()=>{
      const citation=readCitationCandidate(root);
      const status=$(".citation-status",root);
      if(!citation.title&&!citation.doi){
        status.textContent="論文タイトルまたはDOIを入力してください。";
        return;
      }
      const drafts=[];
      drafts.push({
        sourcePaper:$("#title")?.value||"",
        createdAt:new Date().toISOString(),
        readingLevel:"さくっと",
        ...citation
      });
      status.textContent="新しい「さくっと」Notebook候補として保存しました。";
    });

    box.appendChild(node);
  });
}

$("#addCitationCandidate").addEventListener("click",()=>addCitationCandidate());

$("#finishSectionSummary").addEventListener("click",()=>{
  const s=state.paragraphSection;

  if(s==="background"){
    syncCitationCandidates();
  }else{
    state.discussionReflection={
      takeaway:$("#discussionTakeaway").value,
      question:$("#discussionQuestion").value
    };
  }

  const allDone=markComplete(s);
  save();
  if(!allDone)show("page-careful-overview");
});

$("#saveMethods").addEventListener("click",()=>{
  const allDone=markComplete("methods");
  save();
  if(!allDone)show("page-careful-overview");
});

function markComplete(section){
  state.completed[section]=true;
  const el=$(`[data-status="${section}"]`);if(el){el.textContent="完了";el.classList.add("done")}
  $("#map-deep").classList.remove("locked");
  if(Object.values(state.completed).every(Boolean)){
    state.level="careful-complete";
    save();
      show("page-careful-complete");
    return true;
  }
  return false;
}
function openDeepReading(returnPage="page-careful-overview"){
  deepReturnPage=returnPage;
  state.level="deep";
  save();
  $("#map-deep").classList.remove("locked");
  show("deep-page");
}
$("#startDeep").addEventListener("click",()=>openDeepReading("page-careful-overview"));
$("#startDeepFromQuick")?.addEventListener("click",()=>openDeepReading("page-quick-complete"));
$("#map-deep").addEventListener("click",()=>openDeepReading(state.level==="quick-complete"?"page-quick-complete":"page-careful-overview"));
$("#continueToDeep")?.addEventListener("click",()=>{
  openDeepReading("page-careful-complete");
});
$("#backFromDeep")?.addEventListener("click",()=>show(deepReturnPage||"page-quick-complete"));
$("#saveDeep").addEventListener("click",()=>{
  state.level="deep-complete";
  save();
  show("page-deep-complete");
});
$("#finishCarefulNotebook")?.addEventListener("click",async()=>{
  await saveAndFinish("careful-complete");
});
$("#finishDeepNotebook")?.addEventListener("click",async()=>{
  await saveAndFinish("deep-complete");
});

function collect(){
  const v=id=>$("#"+id)?.value||"";
  return {
    schema_version:"2.9.1",
    saved_at:new Date().toISOString(),
    state,
    paper:{
      doi:v("doi"),title:v("title"),authors:v("authors"),journal:v("journal"),year:v("year"),
      keywordsJa:v("keywordsJa"),keywordsEn:v("keywordsEn"),
      discoverySource:v("discoverySource"),introducedBy:v("introducedBy"),searchKeywords:v("searchKeywords"),
      pdfStatus:$('input[name="pdfStatus"]:checked')?.value||"",
      reasons:$$('input[name="reasonType"]:checked').map(x=>x.value),
      usePurposes:$$('input[name="usePurpose"]:checked').map(x=>x.value),
      reason:v("reason")
    },
    quick:{
      abstractMap:{
        background:v("abstractBackground"),gap:v("abstractGap"),objective:v("abstractObjective"),
        result:v("abstractResult"),interpretation:v("abstractInterpretation")
      },
      summaries:$$(".abstract-summary").map(x=>x.value).filter(Boolean)
    },
    reflections:{
      careful:{
        vocabulary:$$("#carefulVocabularyList .vocabulary-row").map(row=>({
          japanese:$(".vocab-ja",row)?.value||"",
          english:$(".vocab-en",row)?.value||"",
          note:$(".vocab-note",row)?.value||""
        })).filter(item=>item.japanese||item.english||item.note),
        question:v("carefulQuestion"),
        harvest:$$('input[name="carefulHarvest"]:checked').map(x=>x.value),
        recommendation:{
          level:$('input[name="carefulRecommendLab"]:checked')?.value||"",
          reason:v("carefulRecommendReason")
        }
      },
      deep:{
        vocabulary:$$("#deepVocabularyList .vocabulary-row").map(row=>({
          japanese:$(".vocab-ja",row)?.value||"",
          english:$(".vocab-en",row)?.value||"",
          note:$(".vocab-note",row)?.value||""
        })).filter(item=>item.japanese||item.english||item.note),
        question:v("deepQuestion"),
        harvest:$$('input[name="deepHarvest"]:checked').map(x=>x.value),
        recommendation:{
          level:$('input[name="deepRecommendLab"]:checked')?.value||"",
          reason:v("deepRecommendReason")
        }
      }
    },
    methods:{subject:v("methodSubject"),sampleSize:v("sampleSize"),design:v("studyDesign"),measurements:v("measurements"),
      analyses:v("analyses"),reference:v("methodReference"),question:v("methodQuestion")},
    deep:{
      focus:v("deepFocus"),
      thinking:v("deepThinking"),
      questions:v("deepQuestions"),
      nextStep:v("deepNextStep"),
      connection:v("deepConnection"),
      analysis:v("deepAnalysis"),
      citations:v("deepCitations"),
      limitations:v("limitations"),
      nextStudy:v("nextStudy"),
      relation:v("relation")
    }
  };
}
function save(){
  // Frontend-only preview: deliberately no persistence.
}

document.body.addEventListener("input",()=>{});

/* =========================================================
   OpenAlex integration v2.3.0
   ========================================================= */
async function openAlexFetch(path,params={}){
  const url=new URL("https://api.openalex.org"+path);
  Object.entries(params||{}).forEach(([key,value])=>{
    if(value!==undefined&&value!==null&&String(value)!=="")url.searchParams.set(key,String(value));
  });
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(url.toString(),{
      headers:{Accept:"application/json"},
      signal:controller.signal
    });
    if(!response.ok){
      const error=new Error(response.status===404
        ?"OpenAlexでこのDOIの書誌情報は見つかりませんでした。DOIを確認するか、タイトルなどを手入力してください。"
        :`OpenAlexへの接続でエラーが発生しました（${response.status}）。`);
      error.status=response.status;
      throw error;
    }
    return await response.json();
  }catch(error){
    if(error.name==="AbortError")throw new Error("OpenAlexの応答が遅いため中断しました。もう一度試してください。");
    throw error;
  }finally{
    clearTimeout(timer);
  }
}

function normalizeDoi(value=""){
  return value.trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i,"")
    .replace(/^doi:\s*/i,"")
    .replace(/[)\].,;:]+$/g,"")
    .trim();
}

function stripDoiUrl(value=""){
  return normalizeDoi(value||"");
}

function reconstructAbstract(index){
  if(!index||typeof index!=="object")return "";
  const words=[];
  Object.entries(index).forEach(([word,positions])=>{
    (positions||[]).forEach(pos=>{words[Number(pos)]=word});
  });
  return words.filter(Boolean).join(" ");
}

function authorText(work){
  const names=(work.authorships||[])
    .map(a=>a.author?.display_name||a.raw_author_name)
    .filter(Boolean);
  if(names.length<=6)return names.join(", ");
  return names.slice(0,6).join(", ")+" et al.";
}

function pageText(work){
  const first=work.biblio?.first_page||"";
  const last=work.biblio?.last_page||"";
  if(first&&last&&first!==last)return `${first}–${last}`;
  return first||last||"";
}

function workToPaper(work){
  const source=work.primary_location?.source?.display_name
    ||work.best_oa_location?.source?.display_name
    ||"";
  const oa=work.open_access||{};
  return {
    openalexId:work.id||"",
    doi:stripDoiUrl(work.doi),
    title:work.title||work.display_name||"",
    authors:authorText(work),
    year:work.publication_year||"",
    journal:source,
    volume:work.biblio?.volume||"",
    issue:work.biblio?.issue||"",
    pages:pageText(work),
    isOa:Boolean(oa.is_oa),
    oaStatus:oa.oa_status||"",
    oaUrl:oa.oa_url||work.best_oa_location?.landing_page_url||"",
    pdfUrl:work.best_oa_location?.pdf_url||"",
    citedByCount:work.cited_by_count||0,
    abstract:reconstructAbstract(work.abstract_inverted_index),
    primaryTopic:work.primary_topic?.display_name||"",
    relevanceScore:work.relevance_score||0
  };
}

function displayPaperMeta(paper){
  const preview=$("#openAlexPaperPreview");
  if(!preview)return;
  const oaBadge=paper.isOa
    ?'<span class="oa-badge open">Open Access</span>'
    :'<span class="oa-badge">OA未確認</span>';
  const links=[
    paper.oaUrl?`<a href="${escapeHtml(paper.oaUrl)}" target="_blank" rel="noopener">論文ページ</a>`:"",
    paper.pdfUrl?`<a href="${escapeHtml(paper.pdfUrl)}" target="_blank" rel="noopener">OA PDF</a>`:""
  ].filter(Boolean).join(" · ");

  preview.innerHTML=`
    <div>
      ${oaBadge}
      <strong>${escapeHtml(paper.primaryTopic||"OpenAlexから取得")}</strong>
      <span>被引用数 ${paper.citedByCount}</span>
    </div>
    ${links?`<p>${links}</p>`:""}
  `;
  preview.hidden=false;
}

function fillMainPaper(work){
  const paper=workToPaper(work);
  $("#doi").value=paper.doi;
  $("#title").value=paper.title;
  $("#authors").value=paper.authors;
  $("#journal").value=paper.journal;
  $("#year").value=paper.year;
  if(paper.primaryTopic&&!$("#keywordsEn").value){
    $("#keywordsEn").value=paper.primaryTopic;
  }
  if(paper.abstract&&!$("#abstractOriginal").value){
    $("#abstractOriginal").value=paper.abstract;
  }
  if(paper.pdfUrl){
    const pdfRadio=$('input[name="pdfStatus"][value="入手済み"]');
    if(pdfRadio)pdfRadio.checked=true;
  }else if(paper.abstract){
    const abstractRadio=$('input[name="pdfStatus"][value="Abstractのみ"]');
    if(abstractRadio&&!$('input[name="pdfStatus"]:checked'))abstractRadio.checked=true;
  }
  displayPaperMeta(paper);
  save();
  return paper;
}

$("#lookupDoi")?.addEventListener("click",async()=>{
  const status=$("#doiLookupStatus");
  const button=$("#lookupDoi");
  const doi=normalizeDoi($("#doi").value);
  if(!doi){
    status.textContent="DOIを入力してください。";
    return;
  }
  status.textContent="OpenAlexで検索中…";
  button.disabled=true;
  try{
    const work=await openAlexFetch(`/works/${encodeURIComponent("doi:"+doi)}`,{
      select:"id,doi,title,display_name,publication_year,authorships,primary_location,best_oa_location,open_access,biblio,abstract_inverted_index,cited_by_count,primary_topic"
    });
    const paper=fillMainPaper(work);
    status.textContent=`書誌情報を読み込みました${paper.abstract?"。Abstractも一時欄へ入力しました。":"。"}`;
  }catch(error){
    status.textContent=error.message;
  }finally{
    button.disabled=false;
  }
});

function citationQuery(citation){
  const parts=[
    citation.title,
    citation.authors,
    citation.journal,
    citation.year
  ].map(v=>String(v||"").trim()).filter(Boolean);
  return parts.join(" ");
}

async function searchCitation(citation){
  if(citation.doi){
    try{
      const work=await openAlexFetch(`/works/${encodeURIComponent("doi:"+normalizeDoi(citation.doi))}`,{
        select:"id,doi,title,display_name,publication_year,authorships,primary_location,best_oa_location,open_access,biblio,cited_by_count,primary_topic"
      });
      return [workToPaper(work)];
    }catch(error){
      if(!citation.title)throw error;
    }
  }

  const query=citationQuery(citation);
  if(query.length<3){
    throw new Error("論文タイトル、著者名、ジャーナル名などを入力してください。");
  }

  const filterParts=[];
  if(citation.year&&/^\d{4}$/.test(citation.year)){
    filterParts.push(`publication_year:${citation.year}`);
  }

  const data=await openAlexFetch("/works",{
    search:query,
    filter:filterParts.join(","),
    per_page:5,
    select:"id,doi,title,display_name,publication_year,authorships,primary_location,best_oa_location,open_access,biblio,cited_by_count,primary_topic,relevance_score"
  });

  return (data.results||[]).map(workToPaper);
}

function candidateCard(paper,index){
  const oa=paper.isOa?'<span class="oa-badge open">Open Access</span>':'<span class="oa-badge">OA未確認</span>';
  const biblio=[
    paper.journal,
    paper.year,
    paper.volume?`vol. ${paper.volume}`:"",
    paper.issue?`no. ${paper.issue}`:"",
    paper.pages?`pp. ${paper.pages}`:""
  ].filter(Boolean).join(" · ");

  return `
    <article class="openalex-result-card" data-result-index="${index}">
      <div class="openalex-result-top">${oa}<span>被引用数 ${paper.citedByCount}</span></div>
      <h4>${escapeHtml(paper.title||"タイトル不明")}</h4>
      <p>${escapeHtml(paper.authors||"著者不明")}</p>
      <small>${escapeHtml(biblio)}</small>
      <div class="openalex-result-actions">
        <button type="button" class="primary small choose-openalex-result" data-result-index="${index}">この論文を選ぶ</button>
        ${paper.oaUrl?`<a class="secondary button-link small" href="${escapeHtml(paper.oaUrl)}" target="_blank" rel="noopener">確認する</a>`:""}
      </div>
    </article>`;
}

function fillCitationFromPaper(root,paper){
  $(".citation-authors",root).value=paper.authors;
  $(".citation-year",root).value=paper.year;
  $(".citation-title",root).value=paper.title;
  $(".citation-journal",root).value=paper.journal;
  $(".citation-volume",root).value=paper.volume;
  $(".citation-issue",root).value=paper.issue;
  $(".citation-pages",root).value=paper.pages;
  $(".citation-doi",root).value=paper.doi;
  root.dataset.openalexId=paper.openalexId;
  root.dataset.isOa=String(paper.isOa);
  root.dataset.oaUrl=paper.oaUrl||"";
  root.dataset.pdfUrl=paper.pdfUrl||"";
  $(".citation-status",root).textContent="この論文を選択しました。";
  $(".openalex-candidate-results",root).innerHTML="";
  syncCitationCandidates();
  save();
}

function bindOpenAlexCitationButtons(root){
  const searchButton=$(".citation-search",root);
  const resultsBox=$(".openalex-candidate-results",root);
  const status=$(".citation-status",root);

  searchButton.addEventListener("click",async()=>{
    const citation=readCitationCandidate(root);
    status.textContent="OpenAlexで候補を検索中…";
    resultsBox.innerHTML="";
    searchButton.disabled=true;
    try{
      const papers=await searchCitation(citation);
      if(!papers.length){
        status.textContent="候補が見つかりませんでした。入力を少し変えて試してください。";
        return;
      }
      root.__openAlexResults=papers;
      resultsBox.innerHTML=papers.map(candidateCard).join("");
      status.textContent=`${papers.length}件の候補が見つかりました。`;
      $$(".choose-openalex-result",resultsBox).forEach(button=>{
        button.addEventListener("click",()=>{
          const paper=root.__openAlexResults[Number(button.dataset.resultIndex)];
          fillCitationFromPaper(root,paper);
        });
      });
    }catch(error){
      status.textContent=error.message;
    }finally{
      searchButton.disabled=false;
    }
  });
}



function setValue(id,value){
  const el=$("#"+id);
  if(el)el.value=value??"";
}
function setChecked(name,values){
  const selected=new Set(Array.isArray(values)?values:[values]);
  $$(`input[name="${name}"]`).forEach(input=>{input.checked=selected.has(input.value)});
}
function replaceVocabulary(stage,items=[]){
  const list=$("#"+stage+"VocabularyList");
  if(!list)return;
  list.innerHTML="";
  const rows=items.length?items:[{}];
  rows.forEach(item=>addStageVocabularyRow(stage,item.japanese||"",item.english||"",item.note||""));
}
function mergeState(saved={}){
  state.level=saved.level||"quick";
  state.completed={...state.completed,...(saved.completed||{})};
  state.figures=Array.isArray(saved.figures)?saved.figures:[];
  state.figureIndex=Number(saved.figureIndex||0);
  state.paragraphs={
    background:Array.isArray(saved.paragraphs?.background)?saved.paragraphs.background:[],
    discussion:Array.isArray(saved.paragraphs?.discussion)?saved.paragraphs.discussion:[]
  };
  state.paragraphSection=saved.paragraphSection||"background";
  state.paragraphIndex=Number(saved.paragraphIndex||0);
  state.sectionSummaries={...state.sectionSummaries,...(saved.sectionSummaries||{})};
  state.backgroundCitations=Array.isArray(saved.backgroundCitations)?saved.backgroundCitations:[];
  state.discussionReflection={...state.discussionReflection,...(saved.discussionReflection||{})};
  state.shared=Boolean(saved.shared);
}
function restoreNotebook(data={}){
  const paper=data.paper||{};
  const quick=data.quick||{};
  const abstractMap=quick.abstractMap||{};
  const methods=data.methods||{};
  const deep=data.deep||{};
  const reflections=data.reflections||{};

  mergeState(data.state||{});
  [["doi",paper.doi],["title",paper.title],["authors",paper.authors],["journal",paper.journal],
   ["year",paper.year],["keywordsJa",paper.keywordsJa],["keywordsEn",paper.keywordsEn],
   ["discoverySource",paper.discoverySource],["introducedBy",paper.introducedBy],
   ["searchKeywords",paper.searchKeywords],["reason",paper.reason],
   ["abstractBackground",abstractMap.background],["abstractGap",abstractMap.gap],
   ["abstractObjective",abstractMap.objective],["abstractResult",abstractMap.result],
   ["abstractInterpretation",abstractMap.interpretation],
   ["methodSubject",methods.subject],["sampleSize",methods.sampleSize],["studyDesign",methods.design],
   ["measurements",methods.measurements],["analyses",methods.analyses],["methodReference",methods.reference],
   ["methodQuestion",methods.question],["deepFocus",deep.focus],["deepThinking",deep.thinking],
   ["deepQuestions",deep.questions],["deepNextStep",deep.nextStep],["deepConnection",deep.connection],
   ["deepAnalysis",deep.analysis],["deepCitations",deep.citations],["limitations",deep.limitations],
   ["nextStudy",deep.nextStudy],["relation",deep.relation],
   ["carefulQuestion",reflections.careful?.question],["carefulRecommendReason",reflections.careful?.recommendation?.reason],
   ["deepQuestion",reflections.deep?.question],["deepRecommendReason",reflections.deep?.recommendation?.reason]
  ].forEach(([id,value])=>setValue(id,value));

  setChecked("pdfStatus",paper.pdfStatus||"");
  setChecked("reasonType",paper.reasons||[]);
  setChecked("usePurpose",paper.usePurposes||[]);
  setChecked("carefulHarvest",reflections.careful?.harvest||[]);
  setChecked("deepHarvest",reflections.deep?.harvest||[]);
  setChecked("carefulRecommendLab",reflections.careful?.recommendation?.level||"");
  setChecked("deepRecommendLab",reflections.deep?.recommendation?.level||"");

  const summaryList=$("#abstractSummaryList");
  if(summaryList){
    summaryList.innerHTML="";
    const summaries=Array.isArray(quick.summaries)&&quick.summaries.length?quick.summaries:["","",""];
    summaries.forEach(addSummary);
  }
  replaceVocabulary("careful",reflections.careful?.vocabulary||[]);
  replaceVocabulary("deep",reflections.deep?.vocabulary||[]);

  Object.entries(state.completed).forEach(([section,done])=>{
    const el=$(`[data-status="${section}"]`);
    if(el&&done){el.textContent="完了";el.classList.add("done")}
  });
  if(state.level!=="quick"){
    $("#map-careful")?.classList.remove("locked");
    $("#map-deep")?.classList.remove("locked");
  }
  if(state.figures.length&&$("#figureCount")) $("#figureCount").value=state.figures.length;
  buildFigureMap();
}
function pageForLevel(level){
  const normalized=String(level||"quick");
  if(normalized==="quick-complete")return "page-quick-complete";
  if(normalized==="careful-complete")return "page-careful-complete";
  if(normalized==="deep"||normalized==="deep-complete")return normalized==="deep-complete"?"page-deep-complete":"deep-page";
  if(normalized==="careful")return "page-careful-overview";
  return "page-quick-basic";
}

const initialNotebookPage=notebookHashPage();
show(initialNotebookPage||"page-quick-basic",{
  updateHash:false,
  scroll:false
});
