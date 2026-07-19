const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>`${Date.now()}-${Math.random().toString(16).slice(2)}`;

let currentStep=1;

function toast(msg){
  const el=$("#toast"); el.textContent=msg; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}
function switchStep(step){
  currentStep=Number(step);
  $$(".starter-step").forEach(p=>p.classList.toggle("active",Number(p.dataset.stepPanel)===currentStep));
  $$(".starter-nav button").forEach(b=>b.classList.toggle("active",Number(b.dataset.step)===currentStep));
  $("#progress-label").textContent=`Step ${currentStep} / 6`;
  $("#progress-bar").style.width=`${currentStep/6*100}%`;
  if(currentStep===6) renderDiagnosis();
  window.scrollTo({top:180,behavior:"smooth"});
}
$$(".starter-nav button").forEach(b=>b.addEventListener("click",()=>switchStep(b.dataset.step)));

function itemShell(inner){
  const wrap=document.createElement("div");
  wrap.className="dynamic-item";
  wrap.innerHTML=`<div class="row"><div class="item-body">${inner}</div><button type="button" class="icon-button remove-item">×</button></div>`;
  $(".remove-item",wrap).addEventListener("click",()=>{wrap.remove(); updateCounts(); autosave();});
  wrap.addEventListener("input",autosave);
  return wrap;
}
function addTheme(data={}){
  const el=itemShell(`<label>気になるテーマ<input class="theme-title" value="${esc(data.title||"")}" placeholder="例：動物の骨格、羽毛、運動"></label>
    <label style="margin-top:10px">今浮かんでいる疑問やメモ<textarea class="theme-note" rows="2">${esc(data.note||"")}</textarea></label>`);
  $("#theme-list").appendChild(el); updateCounts();
}
function addSearchItem(type,data={}){
  const isInteresting=type==="interesting";
  const html=`<div class="form-grid">
      <label>タイトル・内容<input class="search-title" value="${esc(data.title||"")}"></label>
      <label>DOI / URL<input class="search-url" value="${esc(data.url||"")}"></label>
    </div>
    <label style="margin-top:10px">${isInteresting?"なぜ目に留まった？":"なぜ惹かれなかった？"}<textarea class="search-why" rows="2">${esc(data.why||"")}</textarea></label>
    <label style="margin-top:10px">${isInteresting?"どんな問いが浮かんだ？":"それより何の方が面白い？"}<textarea class="search-question" rows="2">${esc(data.question||"")}</textarea></label>`;
  const el=itemShell(html);
  $(`#${type}-list`).appendChild(el); updateCounts();
}
function addQuestion(data={}){
  const el=itemShell(`<label>問い<input class="question-text" value="${esc(data.text||"")}" placeholder="例：尾羽の硬さは潜水頻度によって異なるか？"></label>`);
  $("#question-list").appendChild(el); updateCounts();
}
function esc(s=""){return String(s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[x]));}

$("#add-theme").addEventListener("click",()=>addTheme());
$("#add-interesting").addEventListener("click",()=>addSearchItem("interesting"));
$("#add-boring").addEventListener("click",()=>addSearchItem("boring"));
$("#add-question").addEventListener("click",()=>addQuestion());

function updateCounts(){
  $("#interesting-count").textContent=$$("#interesting-list .dynamic-item").length;
  $("#boring-count").textContent=$$("#boring-list .dynamic-item").length;
  $("#question-count").textContent=$$("#question-list .dynamic-item").length;
}
function collect(){
  const list=(root,fn)=>$$(`${root} .dynamic-item`).map(fn);
  return {
    savedAt:new Date().toISOString(),
    themes:list("#theme-list",el=>({title:$(".theme-title",el).value.trim(),note:$(".theme-note",el).value.trim()})),
    focusTheme:$("#focus-theme").value.trim(),
    whyAttracted:$("#why-attracted").value.trim(),
    selfRelation:$("#self-relation").value.trim(),
    doubtPart:$("#doubt-part").value.trim(),
    successImage:$("#success-image").value.trim(),
    interesting:list("#interesting-list",el=>({title:$(".search-title",el).value.trim(),url:$(".search-url",el).value.trim(),why:$(".search-why",el).value.trim(),question:$(".search-question",el).value.trim()})),
    boring:list("#boring-list",el=>({title:$(".search-title",el).value.trim(),url:$(".search-url",el).value.trim(),why:$(".search-why",el).value.trim(),question:$(".search-question",el).value.trim()})),
    questions:list("#question-list",el=>({text:$(".question-text",el).value.trim()})),
    selectedQuestion:$("#selected-question").value.trim(),
    neededData:$("#needed-data").value.trim(),
    nextSearch:$("#next-search").value.trim()
  };
}
function autosave(){
  const status=$("#autosave-status");
  if(status) status.textContent="入力中";
}
$("#starter-form").addEventListener("input",autosave);

function hydrate(data){
  $("#theme-list").innerHTML="";
  (data.themes||[]).forEach(addTheme);
  if(!(data.themes||[]).length) addTheme();
  $("#focus-theme").value=data.focusTheme||"";
  $("#why-attracted").value=data.whyAttracted||"";
  $("#self-relation").value=data.selfRelation||"";
  $("#doubt-part").value=data.doubtPart||"";
  $("#success-image").value=data.successImage||"";
  $("#interesting-list").innerHTML="";
  (data.interesting||[]).forEach(x=>addSearchItem("interesting",x));
  if(!(data.interesting||[]).length) addSearchItem("interesting");
  $("#boring-list").innerHTML="";
  (data.boring||[]).forEach(x=>addSearchItem("boring",x));
  if(!(data.boring||[]).length) addSearchItem("boring");
  $("#question-list").innerHTML="";
  (data.questions||[]).forEach(addQuestion);
  if(!(data.questions||[]).length) addQuestion();
  $("#selected-question").value=data.selectedQuestion||"";
  $("#needed-data").value=data.neededData||"";
  $("#next-search").value=data.nextSearch||"";
  updateCounts();
}
function renderDiagnosis(){
  const questions=$$("#question-list .question-text").map(x=>x.value.trim()).filter(Boolean);
  const box=$("#diagnosis-list");
  box.innerHTML="";
  questions.forEach((q,i)=>{
    const el=document.createElement("article");
    el.className="dynamic-item";
    el.innerHTML=`<strong>${i+1}. ${esc(q)}</strong>
      <div class="question-diagnosis">
        <label><input type="checkbox"> 疑問形になっている</label>
        <label><input type="checkbox"> 対象が具体的</label>
        <label><input type="checkbox"> 答えを誘導していない</label>
        <label><input type="checkbox"> 必要なデータを想像できる</label>
      </div>`;
    box.appendChild(el);
  });
  if(!questions.length) box.innerHTML="<p class='hint'>Step 5で問いを追加すると、ここで診断できます。</p>";
}
$("#starter-form").addEventListener("submit",e=>{
  e.preventDefault();
  const data=collect();
  toast("入力内容はこの画面内だけで保持されます。");
});
$("#export-starter").addEventListener("click",()=>{
  toast("書き出し機能は現在接続していません。");
});

hydrate({});
