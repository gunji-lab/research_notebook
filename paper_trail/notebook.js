const KEY="papertrail_notebook_v281";
const NOTEBOOK_ID_KEY="papertrail_current_notebook_id";
let serverSaveTimer=null;
let currentNotebookId=localStorage.getItem(NOTEBOOK_ID_KEY)||"";
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

function show(id){
  $$(".rn-page").forEach(p=>p.classList.toggle("active",p.id===id));
  window.scrollTo({top:180,behavior:"smooth"});
}
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.open)));

function addSummary(value=""){
  const row=document.createElement("div");
  row.className="summary-row";
  row.innerHTML='<input class="abstract-summary" placeholder="自分の言葉で要約"><button type="button" class="icon-button">×</button>';
  $(".abstract-summary",row).value=value;
  $("button",row).addEventListener("click",()=>row.remove());
  $("#abstractSummaryList").appendChild(row);
}
addSummary();addSummary();addSummary();
$("#addAbstractSummary").addEventListener("click",()=>addSummary());

$("#translateAbstract").addEventListener("click",()=>{
  $("#abstractTranslation").placeholder="ここに翻訳結果を表示します。翻訳文は保存されません。";
  alert("翻訳APIは未接続です。UI確認用のデモです。");
});

$("#finishQuick").addEventListener("click",()=>{
  state.level="quick-complete";
  $("#map-careful").classList.remove("locked");
  save();
  saveToPaperTrail({silent:true});
  show("page-quick-complete");
});
$("#startCareful").addEventListener("click",()=>{
  state.level="careful";
  $("#map-careful").classList.remove("locked");
  save();
  show("page-careful-overview");
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
function loadParagraph(){
  const section=state.paragraphSection,p=state.paragraphs[section][state.paragraphIndex];
  $("#paragraphSectionLabel").textContent=`じっくり読む · ${section==="background"?"背景":"考察"}`;
  $("#paragraphReaderTitle").textContent=`Paragraph ${state.paragraphIndex+1}を読む`;
  $("#paragraphOriginal").value=p.original;$("#paragraphTranslation").value=p.translation;
  $("#paragraphTitle").value=p.title;$("#paragraphSummary").value=p.summary;$("#paragraphNote").value=p.note;
  const roles=section==="background"?bgRoles:discRoles;
  $("#paragraphRole").innerHTML=roles.map(r=>`<option>${r}</option>`).join("");
  $("#paragraphRole").value=p.role;
  $("#prevParagraph").disabled=state.paragraphIndex===0;
  $("#saveParagraphNext").textContent=state.paragraphIndex===state.paragraphs[section].length-1?"保存して全体をまとめる":"保存して次へ →";
}
function storeParagraph(){
  const p=state.paragraphs[state.paragraphSection][state.paragraphIndex];
  p.title=$("#paragraphTitle").value;p.role=$("#paragraphRole").value;p.summary=$("#paragraphSummary").value;p.note=$("#paragraphNote").value;
}
$("#prevParagraph").addEventListener("click",()=>{storeParagraph();state.paragraphIndex--;loadParagraph()});
$("#saveParagraphNext").addEventListener("click",()=>{
  storeParagraph();
  if(state.paragraphIndex<state.paragraphs[state.paragraphSection].length-1){state.paragraphIndex++;loadParagraph()}
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
      const drafts=JSON.parse(localStorage.getItem("papertrail_next_notebook_drafts")||"[]");
      drafts.push({
        sourcePaper:$("#title")?.value||"",
        createdAt:new Date().toISOString(),
        readingLevel:"さくっと",
        ...citation
      });
      localStorage.setItem("papertrail_next_notebook_drafts",JSON.stringify(drafts));
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

  markComplete(s);
  save();
  show("page-careful-overview");
});

$("#saveMethods").addEventListener("click",()=>{markComplete("methods");save();saveToPaperTrail({silent:true});show("page-careful-overview")});

function markComplete(section){
  state.completed[section]=true;
  const el=$(`[data-status="${section}"]`);if(el){el.textContent="完了";el.classList.add("done")}
  const count=Object.values(state.completed).filter(Boolean).length;
  if(count>=3){$("#map-deep").classList.remove("locked");$("#startDeep").disabled=false}
}
$("#startDeep").addEventListener("click",()=>show("deep-page"));
$("#saveDeep").addEventListener("click",()=>{state.level="deep";save();saveToPaperTrail({silent:false})});

function collect(){
  const v=id=>$("#"+id)?.value||"";
  return {
    schema_version:"2.8.1",
    saved_at:new Date().toISOString(),
    state,
    paper:{doi:v("doi"),title:v("title"),authors:v("authors"),journal:v("journal"),year:v("year"),tags:v("tags"),
      pdfStatus:$('input[name="pdfStatus"]:checked')?.value||"",
      reasons:$$('input[name="reasonType"]:checked').map(x=>x.value),reason:v("reason")},
    quick:{summaries:$$(".abstract-summary").map(x=>x.value).filter(Boolean),subject:v("quickSubject"),purpose:v("quickPurpose")},
    methods:{subject:v("methodSubject"),sampleSize:v("sampleSize"),design:v("studyDesign"),measurements:v("measurements"),
      analyses:v("analyses"),reference:v("methodReference"),question:v("methodQuestion")},
    deep:{analysis:v("deepAnalysis"),citations:v("deepCitations"),limitations:v("limitations"),nextStudy:v("nextStudy"),relation:v("relation")}
  };
}
function notebookPayload(){
  const data=collect();
  return {
    notebookId:currentNotebookId,
    doi:data.paper.doi||"",
    title:data.paper.title||"Untitled",
    readingLevel:data.state.level||"quick",
    shared:Boolean(data.state.shared),
    schemaVersion:data.schema_version,
    notebookJson:data
  };
}

async function saveToPaperTrail({silent=true}={}){
  try{
    const saved=await window.PaperTrailAPI.saveNotebook(notebookPayload());
    if(saved?.notebookId&&!currentNotebookId){
      currentNotebookId=saved.notebookId;
      localStorage.setItem(NOTEBOOK_ID_KEY,currentNotebookId);
    }
    if(!silent)alert("PaperTrailに保存しました。");
    return saved;
  }catch(error){
    if(!silent)alert(`保存できませんでした：${error.message}`);
    console.warn("PaperTrail server save failed:",error);
    return null;
  }
}

function save(){
  localStorage.setItem(KEY,JSON.stringify(collect()));
  clearTimeout(serverSaveTimer);
  serverSaveTimer=setTimeout(()=>saveToPaperTrail({silent:true}),1200);
}

document.body.addEventListener("input",()=>{
  clearTimeout(window.__t);
  window.__t=setTimeout(save,350);
});

/* =========================================================
   OpenAlex integration v2.3.0
   ========================================================= */
async function openAlexFetch(path,params={}){
  if(path.startsWith("/works/")){
    const raw=decodeURIComponent(path.slice("/works/".length));
    const doi=raw.replace(/^doi:/i,"");
    return window.PaperTrailAPI.openAlexWorkByDoi(doi);
  }
  if(path==="/works"){
    const match=String(params.filter||"").match(/publication_year:(\d{4})/);
    return window.PaperTrailAPI.openAlexSearch(params.search||"",match?match[1]:"");
  }
  throw new Error("未対応のOpenAlexリクエストです。");
}

function normalizeDoi(value=""){
  return value.trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i,"")
    .replace(/^doi:\s*/i,"")
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
  if(paper.primaryTopic&&!$("#tags").value){
    $("#tags").value=paper.primaryTopic;
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



show("page-quick-basic");
window.addEventListener("papertrail:user-ready",event=>{
  const user=event.detail||{};
  const el=document.querySelector("#notebookAuthor");
  if(el)el.textContent=user.displayName||user.realName||user.nickname||user.studentId||"—";
});
