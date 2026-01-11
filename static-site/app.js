const form = document.querySelector("#reco-form");
const input = document.querySelector("#movie");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const datalist = document.querySelector("#titles");

const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];

const setStatus = (message, tone = "") => {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
};

const renderResults = (items) => {
  resultsEl.innerHTML = "";
  items.forEach((title, index) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = String(index + 1).padStart(2, "0");
    li.appendChild(label);
    li.appendChild(document.createTextNode(title));
    li.style.animationDelay = `${index * 70}ms`;
    resultsEl.appendChild(li);
  });
};

const buildIndex = () => {
  const titleMap = new Map();
  const genreMap = new Map();
  movies.forEach((movie) => {
    if (!movie || !movie.title) return;
    const titleKey = movie.title.toLowerCase();
    titleMap.set(titleKey, movie.title);
    const genres = (movie.genres || "").split("|").map((g) => g.trim()).filter(Boolean);
    genreMap.set(titleKey, new Set(genres));
  });
  return { titleMap, genreMap };
};

const { titleMap, genreMap } = buildIndex();

const populateDatalist = () => {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => {
    if (!movie || !movie.title) return;
    const option = document.createElement("option");
    option.value = movie.title;
    fragment.appendChild(option);
  });
  datalist.appendChild(fragment);
};

const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((item) => {
    if (b.has(item)) intersection += 1;
  });
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
};

const getRecommendations = (title, topN = 10) => {
  const key = title.toLowerCase();
  if (!genreMap.has(key)) return null;

  const baseGenres = genreMap.get(key);
  const scores = [];

  genreMap.forEach((genres, otherKey) => {
    if (otherKey === key) return;
    scores.push({
      title: titleMap.get(otherKey),
      score: jaccard(baseGenres, genres),
    });
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN).map((item) => item.title);
};

const suggestTitles = (query) => {
  if (!query) return [];
  const lower = query.toLowerCase();
  return movies
    .map((movie) => movie.title)
    .filter((title) => title.toLowerCase().includes(lower))
    .slice(0, 5);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    setStatus("Type a movie title to get recommendations.", "error");
    return;
  }

  setStatus("Tuning the reel...", "");
  resultsEl.innerHTML = "";

  const results = getRecommendations(title);
  if (!results) {
    const suggestions = suggestTitles(title);
    if (suggestions.length) {
      setStatus(`Movie not found. Try: ${suggestions.join(", ")}`, "error");
    } else {
      setStatus("Movie not found. Try a full title with year.", "error");
    }
    return;
  }

  setStatus("Here is your lineup.", "success");
  renderResults(results);
});

populateDatalist();
