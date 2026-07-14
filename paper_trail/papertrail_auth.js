/**
 * Shared authentication/profile UI.
 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  function injectAuthUI() {
    if ($("#papertrail-account")) return;

    const account = document.createElement("div");
    account.id = "papertrail-account";
    account.className = "papertrail-account";
    account.innerHTML = `
      <button type="button" class="account-chip" id="accountChip">
        <span class="account-avatar">PT</span>
        <span>
          <strong id="accountNickname">接続確認中</strong>
          <small id="accountStudentId">PaperTrail</small>
        </span>
      </button>
      <dialog id="accountDialog" class="account-dialog">
        <form method="dialog">
          <div class="dialog-head">
            <div>
              <span class="eyebrow">ACCOUNT</span>
              <h2>PaperTrailの設定</h2>
            </div>
            <button class="icon-button" value="cancel" aria-label="閉じる">×</button>
          </div>

          <section class="account-section">
            <h3>表示名</h3>
            <p>ラボ内では本名やメールアドレスではなく、この表示名を使います。</p>
            <div class="input-action-row">
              <input id="accountNicknameInput" maxlength="30" placeholder="例：めぐ、M.G.">
              <button type="button" class="primary" id="saveNicknameButton">保存</button>
            </div>
            <p class="field-status" id="nicknameStatus"></p>
          </section>

          <section class="account-section">
            <h3>PaperTrail API</h3>
            <p>大学Googleアカウントの確認と、Spreadsheetへの保存に使うGASウェブアプリURLです。</p>
            <label>API URL
              <input id="accountApiUrl" placeholder="https://script.google.com/macros/s/.../exec">
            </label>
            <div class="connection-mode-grid">
              <label class="connection-mode-card">
                <input type="radio" name="backendMode" value="gas">
                <span><strong>大学アカウントで接続</strong><small>本番運用向け</small></span>
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
            <h3>現在のログイン情報</h3>
            <dl>
              <div><dt>学籍番号</dt><dd id="detailStudentId">—</dd></div>
              <div><dt>表示名</dt><dd id="detailNickname">—</dd></div>
              <div><dt>ドメイン</dt><dd id="detailDomain">—</dd></div>
            </dl>
          </section>
        </form>
      </dialog>
    `;
    document.body.appendChild(account);

    const dialog = $("#accountDialog");
    $("#accountChip").addEventListener("click", () => dialog.showModal());

    const config = window.PaperTrailAPI.getConfig();
    $("#accountApiUrl").value = config.apiUrl || "";
    account.querySelectorAll('input[name="backendMode"]').forEach(input => {
      input.checked = input.value === (config.mode || "gas");
    });

    $("#saveBackendButton").addEventListener("click", async () => {
      const apiUrl = $("#accountApiUrl").value.trim();
      const mode = account.querySelector('input[name="backendMode"]:checked')?.value || "gas";
      window.PaperTrailAPI.setConfig({ apiUrl, mode });
      $("#backendStatus").textContent = mode === "local"
        ? "ローカル試用モードに切り替えました。"
        : "PaperTrail API設定を保存しました。";
      await refreshUser();
    });

    $("#testBackendButton").addEventListener("click", async () => {
      $("#backendStatus").textContent = "接続を確認中…";
      try {
        const user = await window.PaperTrailAPI.whoAmI();
        $("#backendStatus").textContent = `${user.studentId} として接続できました。`;
        renderUser(user);
      } catch (error) {
        $("#backendStatus").textContent = error.message;
      }
    });

    $("#saveNicknameButton").addEventListener("click", async () => {
      const nickname = $("#accountNicknameInput").value.trim();
      if (!nickname) {
        $("#nicknameStatus").textContent = "表示名を入力してください。";
        return;
      }
      $("#nicknameStatus").textContent = "保存中…";
      try {
        const user = await window.PaperTrailAPI.registerNickname(nickname);
        renderUser(user);
        $("#nicknameStatus").textContent = "表示名を保存しました。";
      } catch (error) {
        $("#nicknameStatus").textContent = error.message;
      }
    });
  }

  function renderUser(user) {
    if (!user) return;
    $("#accountNickname").textContent = user.nickname || "表示名を設定";
    $("#accountStudentId").textContent = user.studentId || "PaperTrail";
    $("#accountNicknameInput").value = user.nickname || "";
    $("#detailStudentId").textContent = user.studentId || "—";
    $("#detailNickname").textContent = user.nickname || "未設定";
    $("#detailDomain").textContent = user.domain || "—";
    const initials = (user.nickname || user.studentId || "PT").slice(0, 2).toUpperCase();
    $(".account-avatar").textContent = initials;
  }

  async function refreshUser() {
    try {
      const user = await window.PaperTrailAPI.whoAmI();
      renderUser(user);
      document.documentElement.dataset.auth = "ready";
      window.dispatchEvent(new CustomEvent("papertrail:user-ready", { detail: user }));

      if (!user.nickname || user.nickname === user.studentId) {
        $("#accountDialog")?.showModal();
        $("#nicknameStatus").textContent = "最初にラボ内で使う表示名を決めてください。";
      }
      return user;
    } catch (error) {
      document.documentElement.dataset.auth = "error";
      $("#accountNickname").textContent = "接続設定";
      $("#accountStudentId").textContent = "クリックして確認";
      return null;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    injectAuthUI();
    await refreshUser();
  });

  window.PaperTrailAuth = { refreshUser, renderUser };
})();
