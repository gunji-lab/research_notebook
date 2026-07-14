/**
 * PaperTrail identity UI v2.6.0
 */
(() => {
  const $ = (s, r=document) => r.querySelector(s);

  function injectAuthUI(){
    if($("#papertrail-account")) return;
    const wrap=document.createElement("div");
    wrap.id="papertrail-account";
    wrap.className="papertrail-account";
    wrap.innerHTML=`
      <button type="button" class="account-chip" id="accountChip">
        <span class="account-avatar">PT</span>
        <span><strong id="accountDisplayName">接続確認中</strong><small id="accountStudentId">PaperTrail</small></span>
      </button>
      <dialog id="accountDialog" class="account-dialog">
        <form method="dialog">
          <div class="dialog-head">
            <div><span class="eyebrow">ACCOUNT</span><h2>PaperTrailのプロフィール</h2></div>
            <button class="icon-button" value="cancel" aria-label="閉じる">×</button>
          </div>

          <section class="account-section">
            <h3>本人情報</h3>
            <p>氏名はPaperTrail内の著者表示と教員による確認に使用します。</p>
            <label>氏名
              <input id="accountRealName" maxlength="50" placeholder="例：郡司 めぐ">
            </label>
            <label>カスタム表示名
              <input id="accountNickname" maxlength="30" placeholder="例：M. Gunji、めぐ">
            </label>

            <fieldset class="display-mode-fieldset">
              <legend>Notebookで使う表示名</legend>
              <label><input type="radio" name="displayMode" value="real_name" checked> 本名を使う</label>
              <label><input type="radio" name="displayMode" value="nickname"> カスタム表示名を使う</label>
            </fieldset>

            <button type="button" class="primary" id="saveProfileButton">プロフィールを保存</button>
            <p class="field-status" id="profileStatus"></p>
          </section>

          <section class="account-section">
            <h3>PaperTrail API</h3>
            <label>GASウェブアプリURL
              <input id="accountApiUrl" placeholder="https://script.google.com/macros/s/.../exec">
            </label>
            <div class="connection-mode-grid">
              <label class="connection-mode-card">
                <input type="radio" name="backendMode" value="gas">
                <span><strong>大学アカウントで接続</strong><small>Spreadsheetへ保存</small></span>
              </label>
              <label class="connection-mode-card">
                <input type="radio" name="backendMode" value="local">
                <span><strong>ローカル試用</strong><small>このブラウザだけに保存</small></span>
              </label>
            </div>
            <div class="account-actions">
              <button type="button" class="primary" id="saveBackendButton">接続設定を保存</button>
              <button type="button" class="secondary" id="testBackendButton">接続を確認</button>
            </div>
            <p class="field-status" id="backendStatus"></p>
          </section>

          <section class="account-section account-details">
            <h3>現在の情報</h3>
            <dl>
              <div><dt>学籍番号</dt><dd id="detailStudentId">—</dd></div>
              <div><dt>氏名</dt><dd id="detailRealName">—</dd></div>
              <div><dt>表示名</dt><dd id="detailDisplayName">—</dd></div>
              <div><dt>表示モード</dt><dd id="detailDisplayMode">—</dd></div>
              <div><dt>ドメイン</dt><dd id="detailDomain">—</dd></div>
            </dl>
          </section>
        </form>
      </dialog>`;
    document.body.appendChild(wrap);

    const dialog=$("#accountDialog");
    $("#accountChip").addEventListener("click",()=>dialog.showModal());

    const config=window.PaperTrailAPI.getConfig();
    $("#accountApiUrl").value=config.apiUrl||"";
    $$('input[name="backendMode"]',wrap).forEach(i=>i.checked=i.value===(config.mode||"gas"));

    $("#saveBackendButton").addEventListener("click",async()=>{
      const apiUrl=$("#accountApiUrl").value.trim();
      const mode=$('input[name="backendMode"]:checked',wrap)?.value||"gas";
      window.PaperTrailAPI.setConfig({apiUrl,mode});
      $("#backendStatus").textContent=mode==="local"?"ローカル試用モードです。":"API設定を保存しました。";
      await refreshUser();
    });

    $("#testBackendButton").addEventListener("click",async()=>{
      $("#backendStatus").textContent="接続確認中…";
      try{
        const user=await window.PaperTrailAPI.whoAmI();
        renderUser(user);
        $("#backendStatus").textContent=`${user.studentId} として接続できました。`;
      }catch(e){$("#backendStatus").textContent=e.message;}
    });

    $("#saveProfileButton").addEventListener("click",async()=>{
      const realName=$("#accountRealName").value.trim();
      const nickname=$("#accountNickname").value.trim();
      const displayMode=$('input[name="displayMode"]:checked',wrap)?.value||"real_name";
      if(!realName){$("#profileStatus").textContent="氏名を入力してください。";return;}
      if(displayMode==="nickname"&&!nickname){$("#profileStatus").textContent="カスタム表示名を入力してください。";return;}
      $("#profileStatus").textContent="保存中…";
      try{
        const user=await window.PaperTrailAPI.saveProfile({realName,nickname,displayMode});
        renderUser(user);
        $("#profileStatus").textContent="プロフィールを保存しました。";
      }catch(e){$("#profileStatus").textContent=e.message;}
    });
  }

  function $$(s,r=document){return [...r.querySelectorAll(s)]}

  function renderUser(user){
    if(!user)return;
    const display=user.displayName||user.realName||user.nickname||user.studentId||"PaperTrail";
    $("#accountDisplayName").textContent=display;
    $("#accountStudentId").textContent=user.studentId||"PaperTrail";
    $("#accountRealName").value=user.realName||"";
    $("#accountNickname").value=user.nickname||"";
    $$('input[name="displayMode"]').forEach(i=>i.checked=i.value===(user.displayMode||"real_name"));
    $("#detailStudentId").textContent=user.studentId||"—";
    $("#detailRealName").textContent=user.realName||"未設定";
    $("#detailDisplayName").textContent=display;
    $("#detailDisplayMode").textContent=(user.displayMode||"real_name")==="real_name"?"本名":"カスタム表示名";
    $("#detailDomain").textContent=user.domain||"—";
    $(".account-avatar").textContent=display.slice(0,2).toUpperCase();
  }

  async function refreshUser(){
    try{
      const user=await window.PaperTrailAPI.whoAmI();
      renderUser(user);
      window.dispatchEvent(new CustomEvent("papertrail:user-ready",{detail:user}));
      if(!user.realName){
        $("#accountDialog")?.showModal();
        $("#profileStatus").textContent="最初に氏名と表示方法を設定してください。";
      }
      return user;
    }catch(e){
      $("#accountDisplayName").textContent="接続設定";
      $("#accountStudentId").textContent="クリックして確認";
      return null;
    }
  }

  document.addEventListener("DOMContentLoaded",async()=>{injectAuthUI();await refreshUser();});
  window.PaperTrailAuth={refreshUser,renderUser};
})();
