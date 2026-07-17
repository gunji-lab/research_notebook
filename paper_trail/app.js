const STORAGE_KEY = "researchNotebook_v1_cards";
const LAB_KEY = "researchNotebook_v1_lab";

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

let editingId = null;
let backendMyCards = null;
let backendMyLoadSeq = 0;

function uid(){
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function getCards(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function setCards(cards){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
function activeMyCards(){
  return Array.isArray(backendMyCards) ? backendMyCards : getCards();
}
function getLabCards(){
  try {
    const saved = JSON.parse(localStorage.getItem(LAB_KEY) || "null");
    return saved || demoLabCards();
  } catch { return demoLabCards(); }
}
function setLabCards(cards){
  localStorage.setItem(LAB_KEY, JSON.stringify(cards));
}
function escapeHtml(str=""){
  return String(str).replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[s]));
}
function showToast(message){
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"), 2400);
}
function switchView(name){
  $$(".view").forEach(v=>v.classList.toggle("active", v.id === `view-${name}`));
  $$(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view === name));
  window.scrollTo({top:0,behavior:"smooth"});
  if(name==="home") renderRecent();
  if(name==="mine") renderMyCards();
  if(name==="lab") renderLabCards();
  if(name==="dashboard") renderDashboard();
  if(name==="journal"){}
}
$$(".tab").forEach(btn=>btn.addEventListener("click",()=>switchView(btn.dataset.view)));
$$('[data-action="start-new"]').forEach(btn=>btn.addEventListener("click",()=>switchView("new")));

function addParagraph(data={}){
  const node = $("#paragraph-template").content.cloneNode(true);
  const root = $(".paragraph-entry", node);
  $(".p-section", root).value = data.section || "Introduction";
  $(".p-number", root).value = data.number || $$(".paragraph-entry").length + 1;
  $(".p-role", root).value = data.role || "一般背景";
  $(".p-importance", root).value = data.importance || "3";
  $(".p-title", root).value = data.title || "";
  $(".p-summary", root).value = data.summary || "";
  $(".p-temp", root).value = "";
  $(".remove-entry", root).addEventListener("click",()=>root.remove());
  $("#paragraph-list").appendChild(node);
}
function addFigure(data={}){
  const node = $("#figure-template").content.cloneNode(true);
  const root = $(".figure-entry", node);
  $(".f-number", root).value = data.number || "";
  $(".f-importance", root).value = data.importance || "3";
  $(".f-summary", root).value = data.summary || "";
  $(".f-why", root).value = data.why || "";
  $(".remove-entry", root).addEventListener("click",()=>root.remove());
  $("#figure-list").appendChild(node);
}
function addNextPaper(data={}){
  const node = $("#next-paper-template").content.cloneNode(true);
  const root = $(".next-paper-entry", node);
  $(".n-title", root).value = data.title || "";
  $(".n-doi", root).value = data.doi || "";
  $(".n-reason", root).value = data.reason || "";
  $(".remove-entry", root).addEventListener("click",()=>root.remove());
  $("#next-paper-list").appendChild(node);
}
$("#add-paragraph").addEventListener("click",()=>addParagraph());
$("#add-figure").addEventListener("click",()=>addFigure());
$("#add-next-paper").addEventListener("click",()=>addNextPaper());

$$('input[name="readingMode"]').forEach(input=>{
  input.addEventListener("change",()=>{
    $$(".mode-card").forEach(c=>c.classList.toggle("selected", $("input",c).checked));
  });
});

function readParagraphs(){
  return $$(".paragraph-entry").map(root=>({
    section:$(".p-section",root).value,
    number:$(".p-number",root).value,
    role:$(".p-role",root).value,
    importance:Number($(".p-importance",root).value),
    title:$(".p-title",root).value.trim(),
    summary:$(".p-summary",root).value.trim()
  })).filter(p=>p.title || p.summary);
}
function readFigures(){
  return $$(".figure-entry").map(root=>({
    number:$(".f-number",root).value.trim(),
    importance:Number($(".f-importance",root).value),
    summary:$(".f-summary",root).value.trim(),
    why:$(".f-why",root).value.trim()
  })).filter(f=>f.number || f.summary);
}
function readNextPapers(){
  return $$(".next-paper-entry").map(root=>({
    title:$(".n-title",root).value.trim(),
    doi:$(".n-doi",root).value.trim(),
    reason:$(".n-reason",root).value.trim()
  })).filter(n=>n.title || n.doi);
}
$("#paper-form").addEventListener("submit", e=>{
  e.preventDefault();
  const data = {
    id: editingId || uid(),
    createdAt: new Date().toISOString(),
    owner:"自分",
    doi:$("#doi").value.trim(),
    title:$("#title").value.trim(),
    authors:$("#authors").value.trim(),
    journal:$("#journal").value.trim(),
    year:$("#year").value.trim(),
    tags:$("#tags").value.split(",").map(s=>s.trim()).filter(Boolean),
    reasonType:$('input[name="reasonType"]:checked')?.value || "",
    wantToKnow:$("#want-to-know").value.trim(),
    readingMode:$('input[name="readingMode"]:checked')?.value || "さくっと",
    paragraphs:readParagraphs(),
    figures:readFigures(),
    purpose:$("#purpose").value.trim(),
    methods:$("#methods").value.trim(),
    results:$("#results").value.trim(),
    interpretation:$("#interpretation").value.trim(),
    gap:$("#gap").value.trim(),
    relation:$("#relation").value.trim(),
    nextPapers:readNextPapers(),
    question:$("#question").value.trim(),
    reactions:{like:0,curious:0,useful:0},
    teacherRecommended:false
  };
  if(!data.title){
    showToast("タイトルだけ入力してみよう。");
    return;
  }
  const cards = getCards();
  const index = cards.findIndex(c=>c.id===data.id);
  if(index >= 0) cards[index] = {...cards[index],...data};
  else cards.unshift(data);
  setCards(cards);
  showToast("1本分の「論文の地図」ができました！");
  resetForm();
  switchView("mine");
});

function resetForm(){
  editingId = null;
  $("#paper-form").reset();
  $("#paragraph-list").innerHTML="";
  $("#figure-list").innerHTML="";
  $("#next-paper-list").innerHTML="";
  addParagraph();
  addFigure();
  $$('input[name="readingMode"]').forEach(i=>i.dispatchEvent(new Event("change")));
}
$("#clear-form").addEventListener("click",()=>{
  if(confirm("入力内容をクリアしますか？")) resetForm();
});

function formatDate(value){
  if(!value)return "日付なし";
  return String(value).slice(0,10);
}
function cardStage(card){
  return card.readingMode || card.readingLevel || "さくっと";
}
function cardHeh(card){
  return card.backendHeh || card.interpretation || card.results || card.purpose || "";
}
function cardWhy(card){
  return card.backendWhy || card.question || card.gap || "";
}
function cardHtml(card, {lab=false}={}){
  const tags = (card.tags||[]).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join("");
  const snippet = cardHeh(card) || cardWhy(card) || card.wantToKnow || "まだ短いメモはありません";
  const badge = card.teacherRecommended ? `<span class="teacher-badge">🟠 教員おすすめ</span>` : "";
  const reactions = card.reactions || {like:0,curious:0,useful:0};
  const meta = [card.journal, card.authors, card.year].filter(Boolean).join(" · ");
  return `<article class="paper-card card" data-id="${escapeHtml(card.id)}">
    ${badge}
    <div class="paper-card-top">
      <span class="level-badge">${escapeHtml(cardStage(card))}</span>
      <small>${escapeHtml(formatDate(card.updatedAt||card.createdAt))}</small>
    </div>
    <h3>${escapeHtml(card.title)}</h3>
    <p class="meta">${escapeHtml(meta || card.doi || "自分のNotebook")}</p>
    <div class="tags">${tags}</div>
    <div class="snippet">${escapeHtml(snippet)}</div>
    <div class="notebook-markers">
      <span>🌱 へぇ！ ${escapeHtml(cardHeh(card) || "未記入")}</span>
      <span>🤔 なんで？ ${escapeHtml(cardWhy(card) || "未記入")}</span>
    </div>
    <div class="card-actions">
      ${lab ? `
        <button class="reaction" data-reaction="like">👍 いいね！ ${reactions.like||0}</button>
        <button class="reaction" data-reaction="curious">📚 気になる！ ${reactions.curious||0}</button>
        <button class="reaction" data-reaction="useful">💡 参考になった ${reactions.useful||0}</button>
      ` : `
        <button class="primary small edit-card">続きを読む</button>
        ${card.backend ? "" : '<button class="secondary small delete-card">削除</button>'}
      `}
    </div>
  </article>`;
}

function renderRecent(){
  const cards = getCards().slice(0,3);
  const box = $("#recent-cards");
  if(!cards.length){
    box.className="cards-grid empty-state";
    box.innerHTML="<p>まだカードがありません。最初の1本をのぞいてみましょう。</p>";
    return;
  }
  box.className="cards-grid";
  box.innerHTML=cards.map(c=>cardHtml(c)).join("");
  bindCardActions(box,false);
}
function roleMatches(card, role){
  if(!role) return true;
  if(role==="未解明点") return !!card.gap || (card.paragraphs||[]).some(p=>p.role==="未解明点");
  if(role==="研究目的") return !!card.purpose || (card.paragraphs||[]).some(p=>p.role==="研究目的");
  if(role==="限界") return !!card.gap || (card.paragraphs||[]).some(p=>p.role==="限界");
  return (card.paragraphs||[]).some(p=>p.role===role);
}
function searchMatches(card, q){
  if(!q) return true;
  const hay = JSON.stringify(card).toLowerCase();
  return hay.includes(q.toLowerCase());
}
function renderMiniNotes(target, cards, picker, emptyText){
  if(!target)return;
  const notes=cards
    .map(card=>({title:card.title,text:picker(card),id:card.id}))
    .filter(item=>item.text)
    .slice(0,4);
  target.innerHTML=notes.length?notes.map(item=>`
    <button type="button" class="mini-note" data-mini-id="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.text)}</span>
    </button>
  `).join(""):`<p class="empty-mini">${escapeHtml(emptyText)}</p>`;
  $$("[data-mini-id]",target).forEach(button=>button.addEventListener("click",()=>editCard(button.dataset.miniId)));
}
function renderMyNotebookHome(cards){
  const latest=cards[0];
  const lastNote=$("#my-last-note");
  const continueButton=$("#continue-latest");
  if(latest){
    const stage=cardStage(latest);
    if(lastNote)lastNote.textContent=`前回は「${latest.title}」の${stage}まで読みました。`;
    if(continueButton){
      continueButton.disabled=false;
      continueButton.textContent="続きを読む";
      continueButton.onclick=()=>editCard(latest.id);
    }
  }else{
    if(lastNote)lastNote.textContent="まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。";
    if(continueButton){
      continueButton.disabled=false;
      continueButton.textContent="論文を登録する";
      continueButton.onclick=()=>{location.href="notebook.html"};
    }
  }
  renderMiniNotes($("#my-heh-list"),cards,cardHeh,"まだ「へぇ！」はありません。");
  renderMiniNotes($("#my-why-list"),cards,cardWhy,"まだ「なんで？」はありません。");
}
function renderMyCards(){
  const q=$("#my-search").value.trim();
  const role=$("#my-role-filter").value;
  const allCards=activeMyCards();
  renderMyNotebookHome(allCards);
  const recentBox=$("#my-list");
  if(recentBox){
    const recent=allCards.slice(0,3);
    recentBox.innerHTML=recent.length?recent.map(c=>cardHtml(c)).join(""):`<div class="empty-state"><p>まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。</p><a class="primary button-link" href="notebook.html">論文を登録する</a></div>`;
    bindCardActions(recentBox,false);
  }
  const cards=allCards.filter(c=>searchMatches(c,q) && roleMatches(c,role));
  const box=$("#my-cards");
  box.innerHTML = cards.length ? cards.map(c=>cardHtml(c)).join("") : `<div class="empty-state"><p>該当するNotebookはありません。</p></div>`;
  bindCardActions(box,false);
}
function renderLabCards(){
  const q=$("#lab-search").value.trim();
  const role=$("#lab-role-filter").value;
  const cards=getLabCards().filter(c=>searchMatches(c,q) && roleMatches(c,role));
  const box=$("#lab-cards");
  box.innerHTML = cards.map(c=>cardHtml(c,{lab:true})).join("");
  bindCardActions(box,true);
}
$("#my-search").addEventListener("input",renderMyCards);
$("#my-role-filter").addEventListener("change",renderMyCards);
$("#lab-search").addEventListener("input",renderLabCards);
$("#lab-role-filter").addEventListener("change",renderLabCards);

function bindCardActions(root,lab){
  $$(".paper-card",root).forEach(el=>{
    const id=el.dataset.id;
    $$(".reaction",el).forEach(btn=>{
      const reaction=btn.dataset.reaction;
      if(reaction){
        btn.addEventListener("click",()=>{
          const cards=lab?getLabCards():getCards();
          const card=cards.find(c=>c.id===id);
          card.reactions ||= {like:0,curious:0,useful:0};
          card.reactions[reaction]=(card.reactions[reaction]||0)+1;
          lab?setLabCards(cards):setCards(cards);
          lab?renderLabCards():renderMyCards();
          showToast("気持ちを届けました！");
        });
      }
    });
    $(".edit-card",el)?.addEventListener("click",()=>editCard(id));
    $(".delete-card",el)?.addEventListener("click",()=>deleteCard(id));
  });
}
function editCard(id){
  const backendCard=Array.isArray(backendMyCards) ? backendMyCards.find(c=>c.id===id) : null;
  if(backendCard){
    location.href=`notebook.html?notebook=${encodeURIComponent(backendCard.notebookId||backendCard.id)}`;
    return;
  }
  const card=getCards().find(c=>c.id===id);
  if(!card) return;
  resetForm();
  editingId=id;
  $("#doi").value=card.doi||"";
  $("#title").value=card.title||"";
  $("#authors").value=card.authors||"";
  $("#journal").value=card.journal||"";
  $("#year").value=card.year||"";
  $("#tags").value=(card.tags||[]).join(", ");
  $("#want-to-know").value=card.wantToKnow||"";
  const rr=$(`input[name="reasonType"][value="${CSS.escape(card.reasonType||"")}"]`);
  if(rr) rr.checked=true;
  const rm=$(`input[name="readingMode"][value="${CSS.escape(card.readingMode||"さくっと")}"]`);
  if(rm){rm.checked=true;rm.dispatchEvent(new Event("change"))}
  $("#paragraph-list").innerHTML="";
  (card.paragraphs||[]).forEach(addParagraph);
  if(!(card.paragraphs||[]).length) addParagraph();
  $("#figure-list").innerHTML="";
  (card.figures||[]).forEach(addFigure);
  if(!(card.figures||[]).length) addFigure();
  $("#purpose").value=card.purpose||"";
  $("#methods").value=card.methods||"";
  $("#results").value=card.results||"";
  $("#interpretation").value=card.interpretation||"";
  $("#gap").value=card.gap||"";
  $("#relation").value=card.relation||"";
  $("#next-paper-list").innerHTML="";
  (card.nextPapers||[]).forEach(addNextPaper);
  $("#question").value=card.question||"";
  switchView("new");
}
function deleteCard(id){
  if(!confirm("このカードを削除しますか？")) return;
  setCards(getCards().filter(c=>c.id!==id));
  renderMyCards();
  showToast("カードを削除しました。");
}

function renderDashboard(){
  const cards=getCards();
  const paragraphs=cards.flatMap(c=>c.paragraphs||[]);
  const nextCount=cards.reduce((n,c)=>n+(c.nextPapers||[]).length,0);
  const questionCount=cards.filter(c=>c.question).length;
  $("#stats").innerHTML=[
    ["読んだ論文",cards.length],
    ["次に読みたい",nextCount],
    ["残した問い",questionCount],
    ["未解明点",cards.filter(c=>c.gap).length]
  ].map(([label,val])=>`<article class="stat-card card"><strong>${val}</strong><span>${label}</span></article>`).join("");

  const tagCounts={};
  cards.flatMap(c=>c.tags||[]).forEach(t=>tagCounts[t]=(tagCounts[t]||0)+1);
  $("#tag-cloud").innerHTML=Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<button>#${escapeHtml(t)} ${n}</button>`).join("") || "<p class='hint'>タグはまだありません。</p>";

  const roleCounts={};
  paragraphs.forEach(p=>roleCounts[p.role]=(roleCounts[p.role]||0)+1);
  const max=Math.max(1,...Object.values(roleCounts));
  $("#role-summary").innerHTML=Object.entries(roleCounts).sort((a,b)=>b[1]-a[1]).map(([r,n])=>`
    <div class="role-row"><span>${escapeHtml(r)}</span><div class="role-bar"><span style="width:${Math.round(n/max*100)}%"></span></div><strong>${n}</strong></div>
  `).join("") || "<p class='hint'>段落の役割はまだ記録されていません。</p>";

  const gaps=[];
  cards.forEach(c=>{
    if(c.gap) gaps.push({title:c.title,text:c.gap});
    (c.paragraphs||[]).filter(p=>p.role==="未解明点" && p.summary).forEach(p=>gaps.push({title:c.title,text:p.summary}));
  });
  $("#gap-list").innerHTML=gaps.map(g=>`<div class="insight-item"><strong>${escapeHtml(g.title)}</strong>${escapeHtml(g.text)}</div>`).join("") || "<p class='hint'>未解明点を記録すると、ここに集まります。</p>";
}

function demoLabCards(){
  return [
    {
      id:"lab-1",owner:"M2 Aさん",year:"2024",readingMode:"じっくり",
      title:"Mechanical properties of avian tail feathers across flight styles",
      tags:["尾羽","バイオメカニクス","飛行"],
      purpose:"飛行様式と尾羽の力学特性の関係を調べる。",
      gap:"水鳥や潜水性鳥類は十分に比較されていない。",
      reactions:{like:4,curious:3,useful:2},teacherRecommended:true,
      paragraphs:[{role:"未解明点",summary:"潜水時の負荷と尾羽形態の関係は未解明。"}]
    },
    {
      id:"lab-2",owner:"B4 Bさん",year:"2022",readingMode:"さくっと",
      title:"Comparative morphology of the avian pygostyle",
      tags:["鳥類","尾端骨","比較形態"],
      purpose:"鳥類の尾端骨形態を分類群間で比較する。",
      gap:"機能や運動との対応は十分検討されていない。",
      reactions:{like:2,curious:5,useful:1},teacherRecommended:false,
      paragraphs:[{role:"研究目的",summary:"尾端骨形態の系統的多様性を明らかにする。"}]
    },
    {
      id:"lab-3",owner:"M1 Cさん",year:"2025",readingMode:"深掘り",
      title:"Underwater locomotion and feather loading in diving birds",
      tags:["水鳥","潜水","流体力学"],
      purpose:"潜水運動中に羽毛へ加わる負荷を推定する。",
      gap:"尾羽単独の寄与は評価されていない。",
      reactions:{like:5,curious:4,useful:4},teacherRecommended:true,
      paragraphs:[{role:"限界",summary:"種数が少なく、系統の影響を除けていない。"}]
    }
  ];
}
function demoMyCards(){
  return [{
    id:"demo-my",createdAt:new Date().toISOString(),owner:"自分",doi:"10.0000/demo",
    title:"A gentle example paper for Research Notebook",authors:"Example et al.",
    journal:"Journal of Friendly Science",year:"2025",tags:["デモ","読解"],
    reasonType:"検索で見つけた",wantToKnow:"段落の役割をどう見分けるか知りたい。",
    readingMode:"さくっと",
    paragraphs:[
      {section:"Introduction",number:"1",role:"一般背景",importance:3,title:"研究対象の一般的な重要性",summary:"対象が広く利用されていることを説明している。"},
      {section:"Introduction",number:"2",role:"未解明点",importance:5,title:"まだ分かっていないこと",summary:"特定の条件での機能は十分に調べられていない。"}
    ],
    figures:[{number:"Figure 1",importance:5,summary:"研究全体のデザインを示す。",why:"最初に研究の流れを理解できる。"}],
    purpose:"特定条件で対象がどのように機能するかを明らかにする。",
    methods:"2群を比較し、複数の指標を測定した。",
    results:"条件によって主要指標が変化した。",
    interpretation:"環境条件が機能に影響すると解釈している。",
    gap:"対象群と条件が限られている。",
    relation:"段落構造の練習用。",
    nextPapers:[{title:"Example et al. 2023",doi:"10.0000/next",reason:"元になった方法論文だから。"}],
    question:"未解明点と限界はどう区別するとよい？",
    reactions:{like:1,curious:0,useful:1},teacherRecommended:false
  }];
}

$("#load-demo").addEventListener("click",()=>{
  if(!getCards().length) setCards(demoMyCards());
  setLabCards(demoLabCards());
  renderRecent();
  showToast("デモデータを読み込みました！");
});
$("#export-json").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(getCards(),null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="research_notebook_cards.json";a.click();
  URL.revokeObjectURL(url);
});
$("#import-json").addEventListener("change",async e=>{
  const file=e.target.files[0];
  if(!file) return;
  try{
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data)) throw new Error();
    setCards(data);
    renderMyCards();
    showToast("カードを読み込みました！");
  }catch{
    alert("JSONファイルを読み込めませんでした。");
  }
  e.target.value="";
});

addParagraph();
addFigure();
renderRecent();

$$("[data-view-journal]").forEach(btn=>btn.addEventListener("click",()=>switchView("journal")));


function setHomeGreeting(){
  const h = new Date().getHours();
  const text = h < 11 ? "おはようございます。" : h < 18 ? "こんにちは。" : "こんばんは。";
  const el = document.querySelector("#home-greeting");
  if(el) el.textContent = text;
}

function renderHomeLobby(){
  setHomeGreeting();

  const cards = activeMyCards();
  const continueBox = document.querySelector("#continue-card");
  if(continueBox){
    if(cards.length){
      const c = cards[0];
      const meta = [c.authors, c.year, c.readingMode].filter(Boolean).join(" · ");
      continueBox.innerHTML = `
        <div class="continue-main">
          <div>
            <span class="eyebrow">LAST OPENED</span>
            <h3>${escapeHtml(c.title)}</h3>
            <p class="continue-meta">${escapeHtml(meta || "自分のNotebook")}</p>
            <p class="continue-snippet">${escapeHtml(c.wantToKnow || c.purpose || "前回の続きから、少しずつ読み進めましょう。")}</p>
          </div>
          <button class="primary" data-continue-id="${escapeHtml(c.id)}">続きから読む</button>
        </div>`;
      continueBox.querySelector("[data-continue-id]")?.addEventListener("click",()=>editCard(c.id));
    } else {
      continueBox.innerHTML = `<div class="continue-empty"><p>まだ読みかけの論文はありません。</p><button class="secondary" data-action="start-new">最初の1本を開く</button></div>`;
      continueBox.querySelector('[data-action="start-new"]')?.addEventListener("click",()=>switchView("new"));
    }
  }

  const lab = getLabCards().slice(0,3);
  const labBox = document.querySelector("#home-lab-activity");
  if(labBox){
    labBox.innerHTML = lab.map(c=>`
      <article class="lab-activity-card card">
        <div class="lab-activity-person">${escapeHtml(c.owner || "Lab member")}</div>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.gap || c.purpose || "新しいカードが追加されました。")}</p>
        <div class="lab-activity-reactions">👍 ${(c.reactions?.like)||0}　📚 ${(c.reactions?.curious)||0}</div>
      </article>
    `).join("");
  }
}

document.querySelector("#home-doi-button")?.addEventListener("click",()=>{
  const doi = document.querySelector("#home-doi")?.value.trim();
  if(!doi){
    showToast("DOIを貼り付けてみよう。");
    return;
  }
  showToast("DOI自動取得は次のフェーズで実装します。");
});

document.querySelector("[data-view-lab-home]")?.addEventListener("click",()=>switchView("lab"));

const originalSwitchView = switchView;
switchView = function(name){
  originalSwitchView(name);
  if(name === "home") renderHomeLobby();
};

renderHomeLobby();

const initialView = new URLSearchParams(location.search).get("view");


/* =========================================================
   v2.5.0 — GAS-backed My Notebook / Lab / Dashboard
   ========================================================= */
function readingLevelLabel(level){
  const normalized=String(level||"quick").toLowerCase();
  if(normalized.startsWith("deep")) return "🌳 深掘り";
  if(normalized.startsWith("careful")) return "🌿 じっくり";
  return "🌱 さくっと";
}

function notebookItemToCard(item){
  const json=item.notebookJson||{};
  const paper=json.paper||{};
  const quick=json.quick||{};
  const abstractMap=quick.abstractMap||{};
  const reflections=json.reflections||{};
  const careful=reflections.careful||{};
  const deepReflection=reflections.deep||{};
  const deep=json.deep||{};
  const heh=quick.summaries?.[0]
    ||abstractMap.result
    ||abstractMap.interpretation
    ||deep.thinking
    ||"";
  const why=abstractMap.gap
    ||careful.question
    ||deepReflection.question
    ||deep.questions
    ||"";

  return {
    id:item.notebookId,
    notebookId:item.notebookId,
    backend:true,
    createdAt:item.createdAt,
    updatedAt:item.updatedAt,
    owner:"自分",
    doi:item.doi||paper.doi||"",
    title:item.title||paper.title||"Untitled",
    authors:paper.authors||"",
    journal:paper.journal||"",
    year:paper.year||"",
    tags:[paper.keywordsJa,paper.keywordsEn].filter(Boolean),
    readingMode:readingLevelLabel(item.readingLevel),
    readingLevel:item.readingLevel,
    wantToKnow:paper.reason||"",
    purpose:abstractMap.objective||"",
    results:abstractMap.result||"",
    interpretation:abstractMap.interpretation||"",
    gap:abstractMap.gap||"",
    relation:deep.connection||"",
    question:why,
    backendHeh:heh,
    backendWhy:why,
    reactions:{like:0,curious:0,useful:0}
  };
}

function debugNotebookHtml(debug){
  if(!debug)return "";
  const recent=(debug.recent||[]).map(row=>
    `<li>${escapeHtml(row.studentId||"student_idなし")} / ${escapeHtml(row.title||"Untitled")} / ${escapeHtml((row.updatedAt||"").slice(0,10))}</li>`
  ).join("");
  return `<details class="debug-note">
    <summary>保存済みなのに表示されない場合の確認情報</summary>
    <dl>
      <div><dt>現在のアカウントID</dt><dd>${escapeHtml(debug.userStudentId||"")}</dd></div>
      <div><dt>Notebooks総数</dt><dd>${Number(debug.totalNotebooks||0)}</dd></div>
      <div><dt>このアカウントに一致した件数</dt><dd>${Number(debug.matchedNotebooks||0)}</dd></div>
    </dl>
    ${recent?`<p>最新の保存:</p><ul>${recent}</ul>`:""}
  </details>`;
}

async function renderEmptyBackendNotebookState(target){
  let debug=null;
  try{
    debug=await window.PaperTrailAPI.getMyNotebookDebug?.();
  }catch(error){
    console.warn("PaperTrail notebook debug failed:",error);
  }
  if(Array.isArray(debug?.notebooks)&&debug.notebooks.length){
    backendMyCards=debug.notebooks.map(notebookItemToCard);
    renderMyCards();
    renderHomeLobby();
    return;
  }
  target.innerHTML=`<div class="empty-state">
    <p>まだNotebookはありません。気になる論文を一本、さくっと読んでみましょう。</p>
    <a class="primary button-link" href="notebook.html">論文を登録する</a>
    ${debugNotebookHtml(debug)}
  </div>`;
}

async function renderBackendMyNotebooks(){
  const target=document.querySelector("#my-list");
  if(!target)return;
  if(!window.PAPERTRAIL_CONFIG?.GAS_WEB_APP_URL || window.PAPERTRAIL_CONFIG.GAS_WEB_APP_URL.includes("PASTE_"))return;
  if(!window.PaperTrailAuth?.getToken?.()){
    target.innerHTML='<div class="empty-state"><p>大学アカウントでログインすると、保存したNotebookが表示されます。</p></div>';
    return;
  }
  const loadSeq=++backendMyLoadSeq;
  target.innerHTML='<div class="empty">PaperTrailから読み込み中…</div>';
  try{
    const response=await window.PaperTrailAPI.listMyNotebooks();
    if(loadSeq!==backendMyLoadSeq)return;
    if(!Array.isArray(response)){
      throw new Error("Notebook一覧の形式を確認できませんでした。");
    }
    const items=response;
    backendMyCards=items.map(notebookItemToCard);
    renderMyCards();
    renderHomeLobby();
    if(!items.length){
      await renderEmptyBackendNotebookState(target);
      return;
    }

    const latest=items[0];
    const lastNote=$("#my-last-note");
    const continueButton=$("#continue-latest");
    if(latest){
      if(lastNote)lastNote.textContent=`前回は「${latest.title||"Untitled"}」の${readingLevelLabel(latest.readingLevel)}まで読みました。`;
      if(continueButton){
        continueButton.textContent="続きを読む";
        continueButton.onclick=()=>{location.href=`notebook.html?notebook=${encodeURIComponent(latest.notebookId)}`};
      }
    }
  }catch(error){
    if(loadSeq!==backendMyLoadSeq)return;
    renderMyCards();
    target.innerHTML=`<div class="empty-state"><p>Notebookを読み込めませんでした。</p><small>${escapeHtml(error.message||String(error))}</small><button type="button" class="secondary" id="retry-my-notebooks">もう一度読み込む</button></div>`;
    document.querySelector("#retry-my-notebooks")?.addEventListener("click",renderBackendMyNotebooks);
    console.warn("PaperTrail notebook list failed:",error);
  }
}

async function renderBackendLabNotebooks(){
  const target=document.querySelector("#lab-list");
  if(!target)return;
  target.innerHTML='<div class="empty">ラボのNotebookを読み込み中…</div>';
  try{
    const items=await window.PaperTrailAPI.listLabNotebooks();
    target.innerHTML=items.length?items.map(item=>`
      <article class="paper-card">
        <div class="paper-card-top">
          <span class="level-badge">${readingLevelLabel(item.readingLevel)}</span>
          <span class="nickname-badge">${escapeHtml(item.displayName||item.nickname||"Lab member")}</span>
        </div>
        <h3>${escapeHtml(item.title||"Untitled")}</h3>
        <p>${escapeHtml(item.doi||"")}</p>
        <small>更新 ${escapeHtml((item.updatedAt||"").slice(0,10))}</small>
      </article>`).join(""):'<div class="empty">共有されたNotebookはまだありません。</div>';
  }catch(error){
    target.innerHTML=`<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

async function renderBackendDashboard(){
  const target=document.querySelector("#dashboard-content");
  if(!target)return;
  target.innerHTML='<div class="empty">ダッシュボードを読み込み中…</div>';
  try{
    const data=await window.PaperTrailAPI.getDashboard();
    const rows=(data.students||[]).map(student=>`
      <tr>
        <td>${escapeHtml(student.displayName||student.nickname||student.studentId)}</td>
        <td>${student.quickCount||0}</td>
        <td>${student.carefulCount||0}</td>
        <td>${student.deepCount||0}</td>
        <td>${escapeHtml((student.lastUpdatedAt||"").slice(0,10))}</td>
      </tr>`).join("");
    target.innerHTML=`
      <div class="dashboard-table-wrap">
        <table class="dashboard-table">
          <thead><tr><th>表示名</th><th>さくっと</th><th>じっくり</th><th>深掘り</th><th>最終更新</th></tr></thead>
          <tbody>${rows||'<tr><td colspan="5">データがありません。</td></tr>'}</tbody>
        </table>
      </div>`;
  }catch(error){
    target.innerHTML=`<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

const originalSwitchViewV250=switchView;
switchView=function(name){
  originalSwitchViewV250(name);
  if(name==="mine")renderBackendMyNotebooks();
  if(name==="lab")renderBackendLabNotebooks();
  if(name==="dashboard")renderBackendDashboard();
};


// Authentication may finish after the initial My Notebook render.
// Reload the server-backed list as soon as the signed user is ready.
window.addEventListener("papertrail:user-ready",()=>{
  const mine=document.querySelector("#view-mine");
  if(mine?.classList.contains("active")) renderBackendMyNotebooks();
  renderHomeLobby();
});

if(["home","mine","lab","dashboard","journal"].includes(initialView)){
  switchView(initialView);
}
