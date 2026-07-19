/**
 * PaperTrail v3 compatibility shim.
 *
 * The old v2 app kept Home, My Notebook, Lab Notebook, Dashboard, and Journal
 * in one index.html file and switched sections with switchView().
 * v3 uses page-level ownership instead. Keep this file small so stale links
 * using ?view=... or #... still land on the new pages.
 */
(() => {
  const routeMap = {
    home: "index.html",
    new: "notebook.html",
    mine: "my_notebook.html",
    lab: "lab_notebook.html",
    dashboard: "dashboard.html",
    journal: "index.html"
  };

  function decode(value="") {
    try { return decodeURIComponent(value); }
    catch (_) { return ""; }
  }

  const params = new URLSearchParams(location.search);
  const queryView = params.get("view") || "";
  const hashView = decode(location.hash.replace(/^#/, ""));
  const route = routeMap[queryView] ? queryView : routeMap[hashView] ? hashView : "";
  if (!route) return;
  location.replace(routeMap[route]);
})();
