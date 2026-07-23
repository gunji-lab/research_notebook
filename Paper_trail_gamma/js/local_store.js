(() => {
  const DB_NAME = "papertrail-gamma";
  const DB_VERSION = 2;
  const memory = {
    papers: new Map(),
    entries: new Map(),
    readingStates: new Map(),
    notebooks: new Map()
  };
  const STORAGE_PREFIX = "papertrail-gamma:";
  let dbPromise = null;

  function storageKey(name) {
    return `${STORAGE_PREFIX}${name}`;
  }

  function loadFallbackItems(name) {
    try {
      return JSON.parse(localStorage.getItem(storageKey(name)) || "[]");
    } catch (error) {
      console.error("PaperTrail localStorage fallback load failed", error);
      return [];
    }
  }

  function saveFallbackItems(name, items) {
    try {
      localStorage.setItem(storageKey(name), JSON.stringify(items));
    } catch (error) {
      console.error("PaperTrail localStorage fallback save failed", error);
    }
  }

  function putFallback(name, item) {
    const key = item.id || item.paperId;
    memory[name].set(key, item);
    const items = loadFallbackItems(name);
    const index = items.findIndex(saved => (saved.id || saved.paperId) === key);
    if (index >= 0) items[index] = item;
    else items.push(item);
    saveFallbackItems(name, items);
    return item;
  }

  function getFallback(name, key) {
    if (memory[name].has(key)) return memory[name].get(key);
    return loadFallbackItems(name).find(item => (item.id || item.paperId) === key) || null;
  }

  function allFallback(name) {
    const merged = new Map();
    loadFallbackItems(name).forEach(item => merged.set(item.id || item.paperId, item));
    memory[name].forEach((item, key) => merged.set(key, item));
    return [...merged.values()];
  }

  function openDb() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(resolve => {
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => {
        console.warn("PaperTrail IndexedDB open timed out; falling back to memory store.");
        finish(null);
      }, 3000);
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("papers")) db.createObjectStore("papers", { keyPath: "id" });
        if (!db.objectStoreNames.contains("entries")) {
          const store = db.createObjectStore("entries", { keyPath: "id" });
          store.createIndex("paperId", "paperId", { unique: false });
        }
        if (!db.objectStoreNames.contains("readingStates")) db.createObjectStore("readingStates", { keyPath: "paperId" });
        if (!db.objectStoreNames.contains("notebooks")) {
          const store = db.createObjectStore("notebooks", { keyPath: "paperId" });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        finish(request.result);
      };
      request.onerror = () => finish(null);
      request.onblocked = () => {
        console.warn("PaperTrail IndexedDB upgrade was blocked; falling back to memory store.");
        finish(null);
      };
    });
    return dbPromise;
  }

  async function withStore(name, mode, handler) {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, mode);
      const store = tx.objectStore(name);
      const result = handler(store);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function put(name, item) {
    const db = await openDb();
    if (!db) {
      return putFallback(name, item);
    }
    await withStore(name, "readwrite", store => store.put(item));
    putFallback(name, item);
    return item;
  }

  async function get(name, key) {
    const db = await openDb();
    if (!db) return getFallback(name, key);
    return new Promise(resolve => {
      const tx = db.transaction(name, "readonly");
      const request = tx.objectStore(name).get(key);
      request.onsuccess = () => resolve(request.result || getFallback(name, key));
      request.onerror = () => resolve(null);
    });
  }

  async function getByIndex(name, indexName, value) {
    const db = await openDb();
    if (!db) return allFallback(name).filter(item => item[indexName] === value);
    return new Promise(resolve => {
      const tx = db.transaction(name, "readonly");
      const index = tx.objectStore(name).index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => {
        const merged = new Map();
        allFallback(name).filter(item => item[indexName] === value)
          .forEach(item => merged.set(item.id || item.paperId, item));
        (request.result || []).forEach(item => merged.set(item.id || item.paperId, item));
        resolve([...merged.values()]);
      };
      request.onerror = () => resolve([]);
    });
  }

  async function savePaper(paper) {
    return put("papers", { ...paper, updatedAt: new Date().toISOString() });
  }

  async function loadPaper(paperId) {
    return get("papers", paperId);
  }

  async function saveNotebookEntry(entry) {
    return put("entries", { ...entry, updatedAt: new Date().toISOString() });
  }

  async function loadNotebookEntries(paperId) {
    return getByIndex("entries", "paperId", paperId);
  }

  async function saveReadingState(state) {
    return put("readingStates", { ...state, updatedAt: new Date().toISOString() });
  }

  async function loadReadingState(paperId) {
    return get("readingStates", paperId);
  }

  async function saveNotebook(notebook) {
    const existing = notebook?.paperId ? await loadNotebook(notebook.paperId) : null;
    const now = new Date().toISOString();
    return put("notebooks", {
      ...existing,
      ...notebook,
      notebookId: notebook.notebookId || notebook.paperId,
      createdAt: existing?.createdAt || notebook.createdAt || now,
      updatedAt: now
    });
  }

  async function loadNotebook(paperId) {
    return get("notebooks", paperId);
  }

  async function loadNotebooks() {
    const db = await openDb();
    if (!db) {
      return allFallback("notebooks")
        .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    }
    return new Promise(resolve => {
      const tx = db.transaction("notebooks", "readonly");
      const request = tx.objectStore("notebooks").getAll();
      request.onsuccess = () => {
        const merged = new Map();
        allFallback("notebooks").forEach(item => merged.set(item.paperId, item));
        (request.result || []).forEach(item => merged.set(item.paperId, item));
        resolve([...merged.values()]
          .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))));
      };
      request.onerror = () => resolve([]);
    });
  }

  window.PaperTrailLocalStore = {
    savePaper,
    loadPaper,
    saveNotebookEntry,
    loadNotebookEntries,
    saveReadingState,
    loadReadingState,
    saveNotebook,
    loadNotebook,
    loadNotebooks
  };
})();
