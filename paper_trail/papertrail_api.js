/**
 * PaperTrail API v2.9.1
 *
 * GitHub Pages communicates with a GAS-hosted iframe through postMessage.
 * The iframe calls google.script.run, so no cross-origin fetch is needed.
 */
(() => {
  const TIMEOUT_MS = 30000;
  const debugEvents = [];
  const pending = new Map();
  let frame = null;
  let bridgeWindow = null;
  let bridgeId = "";
  let readyPromise = null;

  function debug(message, detail={}) {
    const entry = {
      at: new Date().toISOString(),
      message,
      detail
    };
    debugEvents.push(entry);
    if (debugEvents.length > 40) debugEvents.shift();
    console.debug("[PaperTrail API]", message, detail);
  }

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
    debug("parent-bridge:start", { bridgeId });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        debug("parent-bridge:timeout", { bridgeId });
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
      }, TIMEOUT_MS);

      function onReady(event) {
        if (event.source !== window.parent) return;
        if (event.data?.type !== "papertrail:bridge-ready") return;
        if (event.data?.bridgeId !== bridgeId) return;
        bridgeWindow = event.source || window.parent;
        clearTimeout(timer);
        window.removeEventListener("message", onReady);
        debug("parent-bridge:ready", { bridgeId });
        resolve();
      }

      function sayHello() {
        debug("parent-bridge:hello", { bridgeId });
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
      debug("iframe-bridge:start");
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
      debug("iframe-bridge:src", { bridgeId, src: url.toString() });

      const timer = setTimeout(() => {
        debug("iframe-bridge:timeout", { bridgeId });
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
      }, TIMEOUT_MS);

      function onReady(event) {
        if (event.data?.type !== "papertrail:bridge-ready") return;
        if (event.data?.bridgeId !== bridgeId) return;
        bridgeWindow = event.source || frame.contentWindow;
        clearTimeout(timer);
        window.removeEventListener("message", onReady);
        debug("iframe-bridge:ready", { bridgeId });
        resolve();
      }

      window.addEventListener("message", onReady);
      frame.onerror = () => {
        debug("iframe-bridge:error", { bridgeId, src: frame.src });
        reject(new Error("PaperTrail APIを読み込めませんでした。"));
      };
      document.body.appendChild(frame);
    });
  }

  function ensureBridge() {
    if (readyPromise) return readyPromise;

    try {
      const config = cfg();
      debug("ensure-bridge", {
        mode: window.parent && window.parent !== window ? "parent" : "iframe",
        href: location.href,
        referrer: document.referrer || ""
      });
      readyPromise = window.parent && window.parent !== window
        ? ensureParentBridge()
        : ensureIframeBridge(config);
    } catch (error) {
      debug("ensure-bridge:error", { error: error.message || String(error) });
      readyPromise = Promise.reject(error);
    }

    return readyPromise;
  }

  async function call(method, args={}) {
    debug("call:start", { method });
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
        debug("call:no-target", { method, bridgeId });
        reject(new Error("PaperTrail APIへ接続できませんでした。"));
        return;
      }
      debug("call:post", { method, id, bridgeId });
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
    debug("call:response", { id: data.id, ok: data.ok, error: data.error || "" });

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
    openAlexSearch: (query, year="") => call("openAlexSearch", { query, year }),
    debugBridge: async () => {
      try {
        await ensureBridge();
        return {
          ok: true,
          bridgeId,
          hasFrame: Boolean(frame),
          hasBridgeWindow: Boolean(bridgeWindow),
          events: debugEvents.slice()
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message || String(error),
          bridgeId,
          hasFrame: Boolean(frame),
          hasBridgeWindow: Boolean(bridgeWindow),
          events: debugEvents.slice()
        };
      }
    }
  };
})();
