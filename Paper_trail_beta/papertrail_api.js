/**
 * PaperTrail API v3.0
 *
 * GitHub Pages is the UI only. The GAS parent page owns authentication,
 * google.script.run, and all spreadsheet access.
 */
(() => {
  const API_BUILD = "20260720-gas-parent-referrer-v2";
  const TIMEOUT_MS = 30000;
  const pending = new Map();
  const debugEvents = [];

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

  function requestId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function parentWindow() {
    if (!window.parent || window.parent === window) {
      throw new Error("PaperTrailのGAS入口から開き直してください。");
    }
    if (!/^https:\/\/([^/]+\.)?script\.google(?:usercontent)?\.com\//.test(document.referrer || "")) {
      throw new Error("PaperTrailのGAS入口から開き直してください。");
    }
    return window.parent;
  }

  function getToken() {
    const token = window.PaperTrailAuth?.getToken?.() || "";
    if (!token) {
      throw new Error("大学Googleアカウントでログインしてください。");
    }
    return token;
  }

  function call(method, args={}) {
    const id = requestId();
    const type = `papertrail:${method}`;
    debug("call:start", { method, requestId: id });

    return new Promise((resolve, reject) => {
      let target;
      try {
        target = parentWindow();
      } catch (error) {
        reject(error);
        return;
      }

      let authToken;
      try {
        authToken = getToken();
      } catch (error) {
        reject(error);
        return;
      }

      const timer = setTimeout(() => {
        pending.delete(id);
        debug("call:timeout", { method, requestId: id });
        reject(new Error("PaperTrail APIがタイムアウトしました。"));
      }, TIMEOUT_MS);

      pending.set(id, { resolve, reject, timer });
      target.postMessage({
        type,
        requestId: id,
        payload: {
          args,
          authToken
        }
      }, "*");
    });
  }

  window.addEventListener("message", event => {
    if (event.source !== window.parent) return;

    const data = event.data || {};
    if (data.type !== "papertrail:result" || !data.requestId) return;

    const request = pending.get(data.requestId);
    if (!request) return;

    clearTimeout(request.timer);
    pending.delete(data.requestId);
    debug("call:result", {
      requestId: data.requestId,
      ok: data.ok,
      error: data.error || ""
    });

    if (data.ok) {
      request.resolve(data.result);
    } else {
      request.reject(new Error(data.error || "PaperTrail APIエラー"));
    }
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
    debugConnection: async () => {
      try {
        const profile = await call("whoAmI");
        return {
          ok: true,
          apiBuild: API_BUILD,
          mode: "gas-parent",
          profile,
          href: location.href,
          referrer: document.referrer || "",
          pending: pending.size,
          events: debugEvents.slice()
        };
      } catch (error) {
        return {
          ok: false,
          apiBuild: API_BUILD,
          error: error.message || String(error),
          mode: window.parent && window.parent !== window ? "embedded" : "direct",
          href: location.href,
          referrer: document.referrer || "",
          pending: pending.size,
          events: debugEvents.slice()
        };
      }
    }
  };
})();
