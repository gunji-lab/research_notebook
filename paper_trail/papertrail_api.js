/**
 * PaperTrail Client API v2.5.0
 * GAS backend + local prototype fallback.
 */
(() => {
  const CONFIG_KEY = "papertrail_backend_config_v1";
  const SESSION_KEY = "papertrail_user_session_v1";
  const LOCAL_NOTEBOOKS_KEY = "papertrail_local_notebooks_v1";
  const LOCAL_TRAILS_KEY = "papertrail_local_trails_v1";

  const DEFAULT_CONFIG = {
    apiUrl: "",
    allowedDomain: "toyo.jp",
    mode: "gas"
  };

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "");
      return value && typeof value === "object" ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function getConfig() {
    return { ...DEFAULT_CONFIG, ...readJson(CONFIG_KEY, {}) };
  }

  function setConfig(next) {
    const config = { ...getConfig(), ...next };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return config;
  }

  function getSession() {
    return readJson(SESSION_KEY, null);
  }

  function setSession(session) {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }

  async function request(action, payload = {}, method = "GET") {
    const config = getConfig();
    if (!config.apiUrl) {
      throw new Error("PaperTrail API URLが未設定です。");
    }

    if (method === "GET") {
      const url = new URL(config.apiUrl);
      url.searchParams.set("action", action);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, typeof value === "string" ? value : JSON.stringify(value));
        }
      });
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        redirect: "follow"
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || "PaperTrail APIエラー");
      return data.data;
    }

    // application/x-www-form-urlencoded avoids a CORS preflight with GAS.
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("payload", JSON.stringify(payload));
    const response = await fetch(config.apiUrl, {
      method: "POST",
      credentials: "include",
      redirect: "follow",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString()
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "PaperTrail APIエラー");
    return data.data;
  }

  function localStudent() {
    let session = getSession();
    if (!session) {
      session = {
        studentId: "local-user",
        realName:"Local User",
        nickname:"Local",
        displayMode:"real_name",
        displayName:"Local User",
        domain: "local",
        isAdmin: true,
        mode: "local"
      };
      setSession(session);
    }
    return session;
  }

  function getLocalNotebooks() {
    return readJson(LOCAL_NOTEBOOKS_KEY, []);
  }

  function setLocalNotebooks(items) {
    localStorage.setItem(LOCAL_NOTEBOOKS_KEY, JSON.stringify(items));
  }

  function localSaveNotebook(payload) {
    const items = getLocalNotebooks();
    const now = new Date().toISOString();
    const notebookId = payload.notebookId || `nb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const existingIndex = items.findIndex(item => item.notebookId === notebookId);
    const next = {
      notebookId,
      studentId: localStudent().studentId,
      realName:localStudent().realName||"",
      nickname:localStudent().nickname||"",
      displayName:localStudent().displayName||localStudent().realName||localStudent().nickname,
      displayMode:localStudent().displayMode||"real_name",
      doi: payload.doi || "",
      title: payload.title || "Untitled",
      readingLevel: payload.readingLevel || "quick",
      schemaVersion: payload.schemaVersion || "2.5.0",
      updatedAt: now,
      createdAt: existingIndex >= 0 ? items[existingIndex].createdAt : now,
      shared: Boolean(payload.shared),
      notebookJson: payload.notebookJson || {}
    };
    if (existingIndex >= 0) items[existingIndex] = next;
    else items.unshift(next);
    setLocalNotebooks(items);
    return next;
  }

  async function whoAmI() {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) return localStudent();
    const user = await request("whoAmI");
    setSession(user);
    return user;
  }

  async function registerNickname(nickname) {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) {
      const user = { ...localStudent(), nickname: String(nickname || "").trim() || "Local User" };
      setSession(user);
      return user;
    }
    const user = await request("registerNickname", { nickname }, "POST");
    setSession(user);
    return user;
  }


  async function saveProfile(profile) {
    const config=getConfig();
    if(config.mode==="local"||!config.apiUrl){
      const current=localStudent();
      const next={...current,...profile};
      next.displayName=profile.displayMode==="nickname"?(profile.nickname||profile.realName):profile.realName;
      setSession(next);
      return next;
    }
    const user=await request("saveProfile",profile,"POST");
    setSession(user);
    return user;
  }

  async function saveNotebook(payload) {
    const config = getConfig();
    const enriched = {
      ...payload,
      schemaVersion: payload.schemaVersion || "2.5.0"
    };
    if (config.mode === "local" || !config.apiUrl) return localSaveNotebook(enriched);
    return request("saveNotebook", enriched, "POST");
  }

  async function listMyNotebooks() {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) return getLocalNotebooks();
    return request("listMyNotebooks");
  }

  async function listLabNotebooks() {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) {
      return getLocalNotebooks().filter(item => item.shared);
    }
    return request("listLabNotebooks");
  }

  async function getNotebook(notebookId) {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) {
      return getLocalNotebooks().find(item => item.notebookId === notebookId) || null;
    }
    return request("getNotebook", { notebookId });
  }

  async function saveTrail(payload) {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) {
      const items = readJson(LOCAL_TRAILS_KEY, []);
      const row = {
        trailId: `trail-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        studentId: localStudent().studentId,
        createdAt: new Date().toISOString(),
        ...payload
      };
      items.unshift(row);
      localStorage.setItem(LOCAL_TRAILS_KEY, JSON.stringify(items));
      return row;
    }
    return request("saveTrail", payload, "POST");
  }

  async function getDashboard() {
    const config = getConfig();
    if (config.mode === "local" || !config.apiUrl) {
      const items = getLocalNotebooks();
      return {
        students: [{
          studentId: localStudent().studentId,
          realName:localStudent().realName||"",
      nickname:localStudent().nickname||"",
      displayName:localStudent().displayName||localStudent().realName||localStudent().nickname,
      displayMode:localStudent().displayMode||"real_name",
          quickCount: items.filter(x => ["quick", "quick-complete"].includes(x.readingLevel)).length,
          carefulCount: items.filter(x => x.readingLevel === "careful").length,
          deepCount: items.filter(x => x.readingLevel === "deep").length,
          lastUpdatedAt: items[0]?.updatedAt || ""
        }],
        recentNotebooks: items.slice(0, 10)
      };
    }
    return request("getDashboard");
  }

  window.PaperTrailAPI = {
    getConfig,
    setConfig,
    getSession,
    setSession,
    whoAmI,
    registerNickname,
    saveProfile,
    saveNotebook,
    listMyNotebooks,
    listLabNotebooks,
    getNotebook,
    saveTrail,
    getDashboard
  };
})();
