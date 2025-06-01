const searchForm = document.getElementById("search-form");
const searchResultsContainer = document.getElementById("search-results");

let allProjects = [];

fetch("/api/projects")
  .then(res => res.json())
  .then(data => {
    allProjects = Array.isArray(data) ? data : data.projects || [];
    console.log("allProjects:", allProjects);
  })
  .catch(err => console.error("Failed to load projects:", err));

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("search-input").value.trim().toLowerCase();
  const typeInput = document.getElementById("type").value.trim().toLowerCase();

  const filtered = (Array.isArray(allProjects) ? allProjects : []).filter(project => {
    const title = (project.title || "").toLowerCase();
    const type = ((project.metadata && project.metadata.type) || "").toLowerCase();

    if (nameInput && !title.includes(nameInput)) return false;
    if (typeInput && type !== typeInput) return false;

    return true;
  });

  renderSearchResults(filtered);
});

function renderSearchResults(projects) {
  searchResultsContainer.innerHTML = "";

  if (!projects.length) {
    searchResultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "search-grid";

  projects.forEach(project => {
    const card = document.createElement("a");
    card.href = project.link || `project.html?id=${project.id}`;
    card.className = "search-card";
    card.setAttribute("aria-label", `View details for ${project.title}`);

    const poster = project.poster || "img/placeholder.png";

    const img = document.createElement("img");
    img.src = poster;
    img.alt = project.title || "Poster";
    img.className = "poster";

    const info = document.createElement("div");
    info.className = "info";

    const h3 = document.createElement("h3");
    h3.textContent = project.title || "Untitled";

    const p = document.createElement("p");
    p.textContent = `Type: ${project.metadata?.type || "Unknown"}`;

    info.appendChild(h3);
    info.appendChild(p);

    card.appendChild(img);
    card.appendChild(info);

    grid.appendChild(card);
  });

  searchResultsContainer.appendChild(grid);
}