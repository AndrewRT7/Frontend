const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const messageDiv = document.getElementById("message");
const librarySection = document.getElementById("library-section");
const loginSection = document.getElementById("login-section");
const togglePasswordButton = document.getElementById("togglePassword");

function getChecked(name) {
  return Array.from(document.querySelectorAll(`input[name='${name}']:checked`)).map(el => el.value);
}

function setChecked(name, values) {
  document.querySelectorAll(`input[name='${name}']`).forEach(el => {
    el.checked = values?.includes(el.value);
  });
}

function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

usernameInput.addEventListener("blur", () => {
  const username = usernameInput.value.trim();
  usernameError.textContent = username.length < 4 ? "Username must be at least 4 characters." : "";
  usernameError.style.display = username.length < 4 ? "block" : "none";
});

togglePasswordButton.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePasswordButton.textContent = isPassword ? "Hide" : "Show";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username.length < 4) {
    usernameError.textContent = "Username must be at least 4 characters.";
    usernameError.style.display = "block";
    return;
  }
  usernameError.style.display = "none";

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    messageDiv.textContent = data.message + " Welcome, " + username;
    messageDiv.style.color = "green";
    messageDiv.style.display = "block";

    setTimeout(() => {
      loginSection.style.display = "none";
      librarySection.style.display = "block";
      loadPreferences();
    }, 2400);
  } catch (err) {
    messageDiv.textContent = "Invalid username or password";
    messageDiv.style.color = "red";
    messageDiv.style.display = "block";
  }
});

fetch("/api/current-user")
  .then(res => {
    if (!res.ok) throw new Error("Not logged in");
    return res.json();
  })
  .then(data => {
    messageDiv.textContent = `Welcome, ${data.username}`;
    messageDiv.style.color = "green";
    loginSection.style.display = "none";
    librarySection.style.display = "block";
    loadPreferences();
  })
  .catch(() => {
  });

function loadPreferences() {
  fetch("/api/user/users", {
    credentials: "same-origin"
  })
  .then(res => {
      if (!res.ok) throw new Error("Not logged in");
      return res.json();
    })
    .then(data => {
      setChecked("genre", data.preferredTags);
      setChecked("theme", data.preferredTags);
      setChecked("platform", data.preferredPlatforms);
      setChecked("type", data.preferredTypes);
    })
    .catch(err => console.warn("Preferences not loaded:", err.message));
}

document.getElementById("tag-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const prefs = {
    preferredTags: getChecked("genre").concat(getChecked("theme")),
    preferredPlatforms: getChecked("platform"),
    preferredTypes: getChecked("type")
  };

  fetch("/api/user/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(prefs)
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to save");
      alert("Preferences saved!");
    })
    .catch(() => alert("Could not save preferences"));
});

logoutBtn.addEventListener("click", () => {
  fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin"
  })
  .then(res => {
    if (!res.ok) throw new Error("Log out failed");
    clearCookie("user");
    location.reload();
  })
  .catch(err => alert(err.message));
});

const tabs = document.querySelectorAll('.profile-nav .tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');

    if (target === 'library') {
      loadLibrary();
    }
  });
});

async function loadLibrary() {
  try {
    const projectsRes = await fetch('/api/projects');
    if (!projectsRes.ok) throw new Error('Could not fetch projects');
    const projectsData = await projectsRes.json();
    const allProjects = projectsData.projects || [];

    const favRes = await fetch('/api/user/library', { credentials: 'same-origin' });
    if (!favRes.ok) throw new Error('Could not fetch library');
    const favData = await favRes.json();
    const favorites = favData.favorites || [];

    const libraryProjects = allProjects.filter(proj => favorites.includes(proj.id));

    const libraryDiv = document.getElementById('library-items');
    libraryDiv.innerHTML = '';

    if (libraryProjects.length === 0) {
      libraryDiv.textContent = 'No items in your library yet';
      return;
    }

    libraryProjects.forEach(project => {
      const container = document.createElement('div');
      container.className = 'poster-card';

      const link = document.createElement('a');
      link.href = `project.html?id=${project.id}`;
      link.style.textDecoration = 'none';
      link.style.color = 'inherit';

      const img = document.createElement('img');
      img.src = project.poster;
      img.alt = project.title;

      const titleDiv = document.createElement('div');
      titleDiv.textContent = project.title;
      titleDiv.style.padding = '0.5rem';
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.fontSize = '0.875rem';

      link.appendChild(img);
      link.appendChild(titleDiv);
      container.appendChild(link);
      libraryDiv.appendChild(container);
    });
  } catch (err) {
    console.error('Error loading library:', err);
    document.getElementById('library-items').textContent = 'Failed to load library';
  }
}

fetch('/api/user/library')
.then(res => res.json())
.then(data => {
  const favorites = data.favorites || [];
  const latest = favorites.slice(-3).reverse();
  const ol = document.getElementById('latest-list');
  
  ol.innerHTML = '';
  latest.forEach(projId => {
    const li = document.createElement('li');
    li.textContent = projId;
    ol.appendChild(li);
  });
});