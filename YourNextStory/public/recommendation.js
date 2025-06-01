const container = document.getElementById("recommendations-container");
const sortBtn = document.getElementById("sort-btn");
const sortMode = document.getElementById("sort-mode");
const filterBtn = document.getElementById("filter-btn");
const typeFilter = document.getElementById("type-filter");
const platformFilter = document.getElementById("platform-filter");

let allProjects = [];
let userPrefs = {};
let currentRecommendations = [];

function getDurationValue(project) {
  const duration = project.metadata?.duration;
  if (!duration) return 0;

  const unit = duration.unit ? duration.unit.toLowerCase() : '';
  if (duration.total) {
    return unit.includes("hour") ? duration.total * 60 : duration.total;
  }
  if (duration.range && Array.isArray(duration.range)) {
    const avg = (duration.range[0] + duration.range[1]) / 2;
    return unit.includes("hour") ? avg * 60 : avg;
  }
  if (duration.per_episode && duration.episodes) {
    let total = duration.per_episode * duration.episodes;
    return unit.includes("hour") ? total * 60 : total;
  }
  return 0;
}

fetch("/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data.projects;
    return fetch("/api/user/users");
  })
  .then(res => {
    if (!res.ok) throw new Error("Not logged in");
    return res.json();
  })
  .then(prefs => {
    userPrefs = prefs;
    const recommended = allProjects.filter(p => isRecommended(p, userPrefs));
    currentRecommendations = recommended;
    renderRecommendations(recommended);
  })
  .catch(err => {
    console.warn("User not logged in or failed to fetch preferences:", err);

    if (allProjects.length === 0) {
      container.innerHTML = "<p>Failed to load any projects.</p>";
      return;
    }

    const shuffled = [...allProjects].sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, 3);

    container.innerHTML = `
      <div class="guest-recommendation">
        <h2>You might like these!</h2>
        <div class="guest-recommendation-grid">
        ${sample.map(project => {
          const durationValue = getDurationValue(project);
          return `
            <div class="recommendation" style="cursor: pointer;" onclick="location.href='project.html?id=${project.id}'">
              <img src="${project.poster}" alt="${project.title}" class="poster" />
              <h3>${project.title}</h3>
              <p>Type: ${project.metadata?.type || ""}</p>
              <p>Genres: ${(project.metadata?.genre || []).join(", ")}</p>
              <p>Platform: ${Array.isArray(project.metadata?.platform) ? project.metadata.platform.join(", ") : project.metadata?.platform}</p>
              <p>Duration: ${durationValue ? durationValue + " minutes" : "N/A"}</p>
            </div>
          `;
        }).join("")}
        </div>
        <p class="login-prompt">To see personalized recommendations, please <a href="profile.html">sign in</a>.</p>
      </div>
    `;
  });

function isRecommended(project, prefs) {
  const meta = project.metadata || {};
  const typeMatch = prefs.preferredTypes?.includes(meta.type);
  const tagMatch = prefs.preferredTags?.some(tag =>
    (meta.genre || []).includes(tag) || (meta.theme || []).includes(tag));
  const platformList = Array.isArray(meta.platform) ? meta.platform : [meta.platform];
  const platformMatch = prefs.preferredPlatforms?.some(p => platformList.includes(p));
  return typeMatch || tagMatch || platformMatch;
}

function renderRecommendations(data) {
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = "<p>No recommendations found. Please try different filters</p>";
    return;
  }
  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "recommendation";
    div.style.cursor = "pointer";
    const durationValue = getDurationValue(p);
    div.setAttribute("data-duration", durationValue);

    div.innerHTML = `
      <img src="${p.poster}" alt="${p.title}" class="poster" />
      <h3>${p.title}</h3>
      <p>Type: ${p.metadata?.type || ""}</p>
      <p>Genres: ${(p.metadata?.genre || []).join(", ")}</p>
      <p>Platform: ${Array.isArray(p.metadata?.platform) ? p.metadata.platform.join(", ") : p.metadata?.platform}</p>
      <p>Duration: ${durationValue ? durationValue + " minutes" : "N/A"}</p>
    `;
    div.addEventListener("click", () => {
      location.href = `project.html?id=${p.id}`;
    });

    container.appendChild(div);
  });
}

sortBtn.addEventListener("click", () => {
  const sortBy = sortMode.value;
  let sorted = [...currentRecommendations];

  if (sortBy === "title") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "duration") {
    sorted.sort((b, a) => getDurationValue(a) - getDurationValue(b));
  }

  currentRecommendations = sorted;
  renderRecommendations(sorted);
});

filterBtn.addEventListener("click", () => {
  let filtered = allProjects.filter(p => isRecommended(p, userPrefs));

  const typeValue = typeFilter.value;
  if (typeValue !== "all") {
    filtered = filtered.filter(p => p.metadata?.type === typeValue);
  }

  const platformValue = platformFilter.value;
  if (platformValue !== "all") {
    filtered = filtered.filter(p => {
      const platforms = Array.isArray(p.metadata?.platform)
        ? p.metadata.platform
        : [p.metadata?.platform];
      return platforms.includes(platformValue);
    });
  }

  currentRecommendations = filtered;
  renderRecommendations(filtered);
});