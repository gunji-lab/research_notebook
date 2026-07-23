(() => {
  const DB_NAME = "papertrail-gamma";
  const DB_VERSION = 2;
  const memory = {
    papers: new Map(),
    entries: new Map(),
    readingStates: new Map(),
    notebooks: new Map()
  };
  let dbPromise = null;

  function openDb() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(resolve => {
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
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
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
      memory[name].set(item.id || item.paperId, item);
      return item;
    }
    await withStore(name, "readwrite", store => store.put(item));
    return item;
  }

  async function get(name, key) {
    const db = await openDb();
    if (!db) return memory[name].get(key) || null;
    return new Promise(resolve => {
      const tx = db.transaction(name, "readonly");
      const request = tx.objectStore(name).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async function getByIndex(name, indexName, value) {
    const db = await openDb();
    if (!db) return [...memory[name].values()].filter(item => item[indexName] === value);
    return new Promise(resolve => {
      const tx = db.transaction(name, "readonly");
      const index = tx.objectStore(name).index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
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
      return [...memory.notebooks.values()]
        .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    }
    return new Promise(resolve => {
      const tx = db.transaction("notebooks", "readonly");
      const request = tx.objectStore("notebooks").getAll();
      request.onsuccess = () => resolve((request.result || [])
        .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))));
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
