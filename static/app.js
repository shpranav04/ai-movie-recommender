const form = document.querySelector("#reco-form");
const input = document.querySelector("#movie");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    setStatus("Type a movie title to get recommendations.", "warn");
    return;
  }

  setStatus("Tuning the reel...", "info");
  resultsEl.innerHTML = "";

  try {
    const response = await fetch("/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();
    if (!data.ok) {
      setStatus(data.error || "Something went wrong.", "error");
      return;
    }

    setStatus("Here is your lineup.", "success");
    renderResults(data.results);
  } catch (error) {
    setStatus("Network hiccup. Try again.", "error");
  }
});
