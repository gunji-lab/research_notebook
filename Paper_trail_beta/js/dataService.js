const DATA_CACHE = new Map();

async function loadJson(path) {
  if (!DATA_CACHE.has(path)) {
    DATA_CACHE.set(path, fetch(path).then(response => {
      if (!response.ok) throw new Error(`${path} を読み込めませんでした`);
      return response.json();
    }));
  }
  return DATA_CACHE.get(path);
}

function wait(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export async function getPapers() {
  await wait();
  return loadJson("mock/papers.json");
}

export async function getPaper(id) {
  const papers = await getPapers();
  return papers.find(paper => paper.id === id) || papers[0];
}

export async function searchPaper(query = "") {
  const q = normalize(query);
  const papers = await getPapers();
  if (!q) return papers;
  return papers.filter(paper => {
    const haystack = [
      paper.title,
      paper.authors,
      paper.journal,
      paper.year,
      paper.abstract,
      ...(paper.tags || [])
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

export async function getNotebook(id = "nb-001") {
  const notebooks = await loadJson("mock/notebook.json");
  return notebooks.find(notebook => notebook.id === id) || notebooks[0];
}

export async function getNotebookList() {
  await wait();
  return loadJson("mock/notebook_list.json");
}

export async function saveNotebook(notebook) {
  await wait(180);
  const updatedAt = new Date().toISOString();
  return { ...notebook, updatedAt, saved: true };
}

export async function getLabNotebooks() {
  await wait();
  return loadJson("mock/lab_notebooks.json");
}

export async function getTrail(paperId) {
  const trails = await loadJson("mock/trails.json");
  if (!paperId) return trails;
  return trails.filter(trail => trail.paperId === paperId);
}

export async function getFavorites() {
  await wait();
  return loadJson("mock/favorites.json");
}

export async function getDashboard() {
  const [papers, notebooks, trails, favorites] = await Promise.all([
    getPapers(),
    getNotebookList(),
    getTrail(),
    getFavorites()
  ]);
  return {
    papers: papers.length,
    notebooks: notebooks.length,
    trails: trails.length,
    favorites: favorites.length
  };
}
