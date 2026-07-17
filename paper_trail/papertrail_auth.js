/**
 * PaperTrail authentication v2.9.1
 *
 * Same policy as Physics Trainer:
 * 1. Redirect to GAS ?view=auth
 * 2. GAS checks the active university Google account
 * 3. GAS issues a signed, time-limited token
 * 4. GitHub Pages stores the token and attaches it to API calls
 */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  function config() {
    const cfg = window.PAPERTRAIL_CONFIG || {};
    if (!cfg.GAS_WEB_APP_URL || cfg.GAS_WEB_APP_URL.includes("PASTE_")) {
      throw new Error("管理者によるPaperTrail API設定が必要です。");
    }
    return cfg;
  }

  function tokenKey() {
    return config().TOKEN_STORAGE_KEY || "paperTrailAuthV1";
  }

  function getToken() {
    try { return localStorage.getItem(tokenKey()) || ""; }
    catch (_) { return ""; }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(tokenKey(), token);
      else localStorage.removeItem(tokenKey());
    } catch (_) {}
  }

  function cleanUrl() {
    return location.href.replace(/#.*$/, "");
  }

  function currentRoute() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash || hash.startsWith("auth=")) return "";
    try { return decodeURIComponent(hash); }
    catch (_) { return ""; }
  }

  function currentAppRoute() {
    const page = location.pathname.split("/").pop() || "index.html";
    if (page === "notebook.html") return "new";
    if (page === "my_notebook.html") return "mine";
    if (page === "lab_notebook.html") return "lab";
    if (page === "dashboard.html") return "dashboard";
    return currentRoute() || "home";
  }

  function dispatchHashRouteChange() {
    try {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } catch (_) {
      window.dispatchEvent(new Event("hashchange"));
    }
  }

  function readAuthFromHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const token = params.get("auth");
    if (!token) return false;
    const route = params.get("route") || "";
    setToken(token);
    const nextUrl = location.pathname + location.search
      + (route ? `#${encodeURIComponent(route)}` : "");
    history.replaceState(null, document.title, nextUrl);
    if (route) dispatchHashRouteChange();
    return true;
  }

  function decodeTokenPayload(token) {
    try {
      const body = String(token || "").split(".")[0];
      if (!body) return null;
      const padded = body.replace(/-/g, "+").replace(/_/g, "/")
        + "=".repeat((4 - body.length % 4) % 4);
      return JSON.parse(decodeURIComponent(escape(atob(padded))));
    } catch (_) {
      return null;
    }
  }

  function profileFromToken(token) {
    const payload = decodeTokenPayload(token);
    if (!payload?.sid) return null;
    return {
      studentId: payload.sid,
      realName: "",
      nickname: "",
      displayName: payload.sid,
      displayMode: "real_name",
      isPendingApi: true
    };
  }

  function loginUrl() {
    const cfg = config();
    const params = new URLSearchParams({
      view: "app",
      route: currentAppRoute()
    });
    return cfg.GAS_WEB_APP_URL + "?" + params.toString();
  }

  function injectAccountUI() {
    if ($("#papertrail-account")) return;

    const wrap = document.createElement("div");
    wrap.id = "papertrail-account";
    wrap.className = "papertrail-account";
    wrap.innerHTML = `
      <button type="button" class="account-chip" id="accountChip">
        <span class="account-avatar">PT</span>
        <span>
          <strong id="accountDisplayName">ログイン確認中</strong>
          <small id="accountStudentId">PaperTrail</small>
        </span>
      </button>

      <dialog id="accountDialog" class="account-dialog">
        <form method="dialog">
          <div class="dialog-head">
            <div>
              <span class="eyebrow">ACCOUNT</span>
              <h2>PaperTrailのプロフィール</h2>
            </div>
            <button class="icon-button" value="cancel" aria-label="閉じる">×</button>
          </div>

          <section class="account-section" id="loginSection">
            <h3>大学Googleアカウントでログイン</h3>
            <p>GAS URLやOpenAlex APIキーを入力する必要はありません。</p>
            <a class="primary button-link" id="loginLink" href="#">大学アカウントでログイン</a>
            <p class="field-status" id="loginStatus"></p>
          </section>

          <section class="account-section" id="profileSection" hidden>
            <h3>本人情報</h3>
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

            <div class="account-actions">
              <button type="button" class="primary" id="saveProfileButton">プロフィールを保存</button>
              <button type="button" class="secondary" id="signOutButton">ログアウト</button>
            </div>
            <p class="field-status" id="profileStatus"></p>
          </section>

          <section class="account-section account-details" id="accountDetails" hidden>
            <h3>現在の情報</h3>
            <dl>
              <div><dt>学籍番号</dt><dd id="detailStudentId">—</dd></div>
              <div><dt>氏名</dt><dd id="detailRealName">—</dd></div>
              <div><dt>表示名</dt><dd id="detailDisplayName">—</dd></div>
              <div><dt>接続</dt><dd>大学Googleアカウント</dd></div>
            </dl>
          </section>
        </form>
      </dialog>
    `;
    document.body.appendChild(wrap);

    const dialog = $("#accountDialog");
    $("#accountChip").addEventListener("click", () => dialog.showModal());

    try {
      $("#loginLink").href = loginUrl();
    } catch (error) {
      $("#loginStatus").textContent = error.message;
    }

    $("#saveProfileButton").addEventListener("click", async () => {
      const realName = $("#accountRealName").value.trim();
      const nickname = $("#accountNickname").value.trim();
      const displayMode = $('input[name="displayMode"]:checked')?.value || "real_name";

      if (!realName) {
        $("#profileStatus").textContent = "氏名を入力してください。";
        return;
      }
      if (displayMode === "nickname" && !nickname) {
        $("#profileStatus").textContent = "カスタム表示名を入力してください。";
        return;
      }

      $("#profileStatus").textContent = "保存中…";
      try {
        const profile = await window.PaperTrailAPI.saveProfile({ realName, nickname, displayMode });
        renderProfile(profile);
        $("#profileStatus").textContent = "プロフィールを保存しました。";
      } catch (error) {
        $("#profileStatus").textContent = error.message;
      }
    });

    $("#signOutButton").addEventListener("click", () => {
      setToken("");
      location.reload();
    });
  }

  function renderProfile(profile) {
    const display = profile.displayName || profile.realName || profile.nickname || profile.studentId || "PaperTrail";
    $("#accountDisplayName").textContent = display;
    $("#accountStudentId").textContent = profile.studentId || "PaperTrail";
    $("#accountRealName").value = profile.realName || "";
    $("#accountNickname").value = profile.nickname || "";
    $$('input[name="displayMode"]').forEach(input => {
      input.checked = input.value === (profile.displayMode || "real_name");
    });
    $("#detailStudentId").textContent = profile.studentId || "—";
    $("#detailRealName").textContent = profile.realName || "未設定";
    $("#detailDisplayName").textContent = display;
    $(".account-avatar").textContent = display.slice(0, 2).toUpperCase();
    $("#loginSection").hidden = true;
    $("#profileSection").hidden = false;
    $("#accountDetails").hidden = false;
  }

  async function refreshUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const profile = await window.PaperTrailAPI.whoAmI();
      renderProfile(profile);
      window.dispatchEvent(new CustomEvent("papertrail:user-ready", { detail: profile }));
      if (!profile.realName) {
        $("#accountDialog")?.showModal();
        $("#profileStatus").textContent = "最初に氏名と表示方法を設定してください。";
      }
      return profile;
    } catch (error) {
      const authErrorPattern = /ログイン情報|有効期限|許可されていない/;
      if (authErrorPattern.test(error.message || "")) {
        setToken("");
      }
      throw error;
    }
  }

  async function boot() {
    injectAccountUI();
    readAuthFromHash();

    if (!getToken()) {
      $("#accountDisplayName").textContent = "ログイン";
      $("#accountStudentId").textContent = "大学Googleアカウント";
      $("#accountDialog")?.showModal();
      return;
    }

    const provisionalProfile = profileFromToken(getToken());
    if (provisionalProfile) {
      renderProfile(provisionalProfile);
      $("#profileStatus").textContent = "ログイン済みです。保存機能の接続を確認中…";
    }
    $("#loginStatus").textContent = "本人確認中…";
    try {
      await refreshUser();
      $("#loginStatus").textContent = "";
      $("#profileStatus").textContent = "";
    } catch (error) {
      const hasToken = Boolean(getToken());
      $("#accountDisplayName").textContent = hasToken ? "ログイン済み" : "ログイン";
      $("#accountStudentId").textContent = provisionalProfile?.studentId || "大学Googleアカウント";
      $("#loginStatus").textContent = hasToken
        ? "ログインは完了しています。保存機能の接続だけ確認できていません。"
        : error.message;
      $("#profileStatus").textContent = error.message;
      $("#accountDialog")?.showModal();
    }
  }

  document.addEventListener("DOMContentLoaded", boot);

  window.PaperTrailAuth = {
    getToken,
    setToken,
    loginUrl,
    refreshUser
  };
})();
