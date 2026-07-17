(() => {
  const { $, escapeHtml, requireAuth, readingLevelLabel } = window.PaperTrailCommon;
  const redirected = window.PaperTrailCommon.redirectToGasShellIfNeeded("dashboard");

  function renderDashboard(data) {
    const target = $("#dashboard-content");
    if (!target) return;
    const students = data.students || [];
    const totals = students.reduce((sum, student) => ({
      quick: sum.quick + Number(student.quickCount || 0),
      careful: sum.careful + Number(student.carefulCount || 0),
      deep: sum.deep + Number(student.deepCount || 0)
    }), { quick:0, careful:0, deep:0 });
    const totalRead = totals.quick + totals.careful + totals.deep;
    const rows = students.map(student => `
      <tr>
        <td>${escapeHtml(student.displayName || student.nickname || student.studentId)}</td>
        <td>${student.quickCount || 0}</td>
        <td>${student.carefulCount || 0}</td>
        <td>${student.deepCount || 0}</td>
        <td>${escapeHtml((student.lastUpdatedAt || "").slice(0, 10))}</td>
      </tr>
    `).join("");
    target.innerHTML = `
      <div class="stats-grid">
        <article class="stat-card card"><strong>${totalRead}</strong><span>保存されたNotebook</span></article>
        <article class="stat-card card"><strong>${totals.quick}</strong><span>${readingLevelLabel("quick")}</span></article>
        <article class="stat-card card"><strong>${totals.careful}</strong><span>${readingLevelLabel("careful")}</span></article>
        <article class="stat-card card"><strong>${totals.deep}</strong><span>${readingLevelLabel("deep")}</span></article>
      </div>
      <div class="dashboard-table-wrap">
        <table class="dashboard-table">
          <thead><tr><th>表示名</th><th>さくっと</th><th>じっくり</th><th>深掘り</th><th>最終更新</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">データがありません。</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  async function loadDashboard() {
    if (redirected) return;
    const target = $("#dashboard-content");
    if (!target) return;
    if (!requireAuth(target, "大学アカウントでログインすると、学習分析が表示されます。")) return;
    target.innerHTML = '<div class="empty">ダッシュボードを読み込み中…</div>';
    try {
      const data = await window.PaperTrailAPI.getDashboard();
      renderDashboard(data || {});
    } catch (error) {
      target.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message || "ダッシュボードを読み込めませんでした。")}</p></div>`;
      console.warn("PaperTrail dashboard failed:", error);
    }
  }

  window.addEventListener("papertrail:user-ready", loadDashboard);
  document.addEventListener("DOMContentLoaded", loadDashboard);
})();
