/**
 * PaperTrail API v2.9.1
 *
 * GitHub Pages communicates with a GAS-hosted iframe through postMessage.
 * The iframe calls google.script.run, so no cross-origin fetch is needed.
 */
(() => {
  const TIMEOUT_MS = 30000;
  const pending = new Map();
  let frame = null;
  let bridgeWindow = null;
  let bridgeId = "";
  let readyPromise = null;

  function cfg() {
    const value = window.PAPERTRAIL_CONFIG || {};
    if (!value.GAS_WEB_APP_URL || value.GAS_WEB_APP_URL.includes("PASTE_")) {
      throw new Error("PaperTrail APIが設定されていません。");
    }
    return value;
  }

  function createBridgeId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ensureParentBridge() {
    bridgeId = createBridgeId();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
      }, TIMEOUT_MS);

      function onReady(event) {
        if (event.source !== window.parent) return;
        if (event.data?.type !== "papertrail:bridge-ready") return;
        if (event.data?.bridgeId !== bridgeId) return;
        bridgeWindow = event.source || window.parent;
        clearTimeout(timer);
        window.removeEventListener("message", onReady);
        resolve();
      }

      function sayHello() {
        window.parent.postMessage({
          type: "papertrail:hello",
          bridgeId
        }, "*");
      }

      window.addEventListener("message", onReady);
      sayHello();
      setTimeout(sayHello, 500);
      setTimeout(sayHello, 1500);
    });
  }

  function ensureIframeBridge(config) {
    return new Promise((resolve, reject) => {
      frame = document.createElement("iframe");
      frame.id = "papertrail-api-bridge";
      frame.hidden = true;
      frame.setAttribute("aria-hidden", "true");
      frame.title = "PaperTrail API bridge";

      const url = new URL(config.GAS_WEB_APP_URL);
      url.searchParams.set("view", "bridge");
      bridgeId = createBridgeId();
      url.searchParams.set("bridge", bridgeId);
      frame.src = url.toString();

      const timer = setTimeout(() => {
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
      }, TIMEOUT_MS);

      function onReady(event) {
        if (event.data?.type !== "papertrail:bridge-ready") return;
        if (event.data?.bridgeId !== bridgeId) return;
        bridgeWindow = event.source || frame.contentWindow;
        clearTimeout(timer);
        window.removeEventListener("message", onReady);
        resolve();
      }

      window.addEventListener("message", onReady);
      frame.onerror = () => reject(new Error("PaperTrail APIを読み込めませんでした。"));
      document.body.appendChild(frame);
    });
  }

  function ensureBridge() {
    if (readyPromise) return readyPromise;

    try {
      const config = cfg();
      readyPromise = window.parent && window.parent !== window
        ? ensureParentBridge()
        : ensureIframeBridge(config);
    } catch (error) {
      readyPromise = Promise.reject(error);
    }

    return readyPromise;
  }

  async function call(method, args={}) {
    await ensureBridge();

    const token = window.PaperTrailAuth?.getToken?.() || "";
    if (!token) throw new Error("大学Googleアカウントでログインしてください。");

    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("PaperTrail APIがタイムアウトしました。"));
      }, TIMEOUT_MS);

      pending.set(id, { resolve, reject, timer });
      const target = bridgeWindow || frame?.contentWindow;
      if (!target) {
        pending.delete(id);
        clearTimeout(timer);
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
        return;
      }
      target.postMessage({
        type: "papertrail:request",
        bridgeId,
        id,
        method,
        args,
        authToken: token
      }, "*");
    });
  }

  window.addEventListener("message", event => {
    if (!frame && !bridgeWindow) return;
    if (bridgeWindow && event.source !== bridgeWindow) return;
    const data = event.data || {};
    if (data.bridgeId !== bridgeId) return;
    if (data.type !== "papertrail:response" || !data.id) return;

    const request = pending.get(data.id);
    if (!request) return;

    clearTimeout(request.timer);
    pending.delete(data.id);

    if (data.ok) request.resolve(data.data);
    else request.reject(new Error(data.error || "PaperTrail APIエラー"));
  });

  window.PaperTrailAPI = {
    whoAmI: () => call("whoAmI"),
    saveProfile: profile => call("saveProfile", profile),
    saveNotebook: payload => call("saveNotebook", payload),
    listMyNotebooks: () => call("listMyNotebooks"),
    getMyNotebookDebug: () => call("getMyNotebookDebug"),
    listLabNotebooks: () => call("listLabNotebooks"),
    getNotebook: notebookId => call("getNotebook", { notebookId }),
    saveTrail: payload => call("saveTrail", payload),
    getDashboard: () => call("getDashboard"),
    openAlexWorkByDoi: doi => call("openAlexWorkByDoi", { doi }),
    openAlexSearch: (query, year="") => call("openAlexSearch", { query, year })
  };
})();
