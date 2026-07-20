(() => {
  const { $, showToast } = window.PaperTrailCommon;

  function redirectLegacyRoute() {
    const params = new URLSearchParams(location.search);
    const rawHash = location.hash.replace(/^#/, "");
    const route = params.get("view") || rawHash;
    const map = {
      new: "notebook.html",
      mine: "my_notebook.html",
      lab: "lab_notebook.html",
      dashboard: "dashboard.html"
    };
    if (map[route]) {
      location.replace(map[route]);
      return true;
    }
    return false;
  }

  function setHomeGreeting() {
    const h = new Date().getHours();
    const text = h < 11 ? "おはようございます。" : h < 18 ? "こんにちは。" : "こんばんは。";
    const el = $("#home-greeting");
    if (el) el.textContent = text;
  }

  function boot() {
    if (redirectLegacyRoute()) return;
    setHomeGreeting();
    $("#home-doi-button")?.addEventListener("click", event => {
      const doi = $("#home-doi")?.value.trim();
      if (!doi) return;
      event.preventDefault();
      showToast("DOI自動取得は次の開発フェーズで実装します。");
    });
    const activity = $("#home-lab-activity");
    if (activity) activity.innerHTML = '<div class="empty-state"><p>共有機能は現在接続していません。</p></div>';
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
