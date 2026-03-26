const STORAGE_KEYS = {
  users: "ursa_users",
  currentUser: "ursa_current_user",
  theme: "ursa_theme",
  complaints: "ursa_complaints"
};

const PAGE_FILES = {
  login: "index.html",
  register: "register.html",
  home: "home.html",
  report: "report.html",
  myreports: "myreports.html",
  map: "map.html",
  emergency: "emergency.html",
  settings: "settings.html"
};

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
}

function setUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || "null");
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function getValidatedCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getUsers();
  const existingUser = users.find(
    u => u.nationalId === currentUser.nationalId && u.phone === currentUser.phone
  );

  if (!existingUser) {
    clearCurrentUser();
    return null;
  }

  return existingUser;
}

function navigate(pageName) {
  const target = PAGE_FILES[pageName];
  if (target) window.location.href = target;
}

function applyTheme(mode) {
  if (mode === "light") {
    document.body.classList.remove("dark");
    document.getElementById("lightModeBtn")?.classList.add("active");
    document.getElementById("darkModeBtn")?.classList.remove("active");
  } else {
    document.body.classList.add("dark");
    document.getElementById("darkModeBtn")?.classList.add("active");
    document.getElementById("lightModeBtn")?.classList.remove("active");
  }
  localStorage.setItem(STORAGE_KEYS.theme, mode);
}

function openSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("show");
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

function updateGreeting() {
  const el = document.getElementById("homeGreeting");
  if (!el) return;
  const h = new Date().getHours();
  el.textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function populateUserData() {
  const user = getValidatedCurrentUser();
  if (!user) return;
  document.getElementById("homeUserName") && (document.getElementById("homeUserName").textContent = user.fullName || "User");
  document.getElementById("homeUserMeta") && (document.getElementById("homeUserMeta").textContent = `National ID: ${user.nationalId || "-"}`);
  document.getElementById("homeGovernorate") && (document.getElementById("homeGovernorate").textContent = user.governorate || "-");
  document.getElementById("homePhone") && (document.getElementById("homePhone").textContent = user.phone || "-");
  document.getElementById("settingsFullName") && (document.getElementById("settingsFullName").value = user.fullName || "");
  document.getElementById("settingsPhone") && (document.getElementById("settingsPhone").value = user.phone || "");
  document.getElementById("settingsGovernorate") && (document.getElementById("settingsGovernorate").value = user.governorate || "");
}

function bindLayout() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".sidebar a[data-page]").forEach(link => {
    const page = link.dataset.page;
    link.href = PAGE_FILES[page] || "#";
    if (currentPage === page) link.classList.add("active");
    link.addEventListener("click", e => {
      e.preventDefault();
      navigate(page);
    });
  });
  document.getElementById("openSidebar")?.addEventListener("click", openSidebar);
  document.getElementById("closeSidebar")?.addEventListener("click", closeSidebar);
  document.getElementById("overlay")?.addEventListener("click", closeSidebar);
  document.getElementById("lightModeBtn")?.addEventListener("click", () => applyTheme("light"));
  document.getElementById("darkModeBtn")?.addEventListener("click", () => applyTheme("dark"));
}

function bindAuthPages() {
  document.getElementById("goToRegister")?.addEventListener("click", () => navigate("register"));
  document.getElementById("backToLogin")?.addEventListener("click", () => navigate("login"));

  document.getElementById("loginForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;
    const user = getUsers().find(u => (u.phone === identifier || u.nationalId === identifier) && u.password === password);
    if (!user) {
      const err = document.getElementById("loginError");
      err.textContent = "Wrong credentials";
      err.style.display = "block";
      return;
    }
    setCurrentUser(user);
    navigate("home");
  });

  document.getElementById("registerForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const fullName = document.getElementById("regFullName").value.trim();
    const nationalId = document.getElementById("regNationalId").value.trim();
    const governorate = document.getElementById("regGovernorate").value;
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPass = document.getElementById("regConfirmPassword").value;
    const errorEl = document.getElementById("registerError");
    const successEl = document.getElementById("registerSuccess");
    errorEl.style.display = "none";
    successEl.style.display = "none";

    if (!fullName || !nationalId || !governorate || !phone || !password || !confirmPass) {
      errorEl.textContent = "All fields are required.";
      errorEl.style.display = "block";
      return;
    }
    if (!/^\d{14}$/.test(nationalId) || !/^\d{11}$/.test(phone)) {
      errorEl.textContent = "National ID must be 14 digits and phone must be 11 digits.";
      errorEl.style.display = "block";
      return;
    }
    if (password !== confirmPass) {
      errorEl.textContent = "Passwords do not match.";
      errorEl.style.display = "block";
      return;
    }

    const users = getUsers();
    if (users.some(u => u.phone === phone || u.nationalId === nationalId)) {
      errorEl.textContent = "This account already exists.";
      errorEl.style.display = "block";
      return;
    }

    const newUser = { fullName, nationalId, governorate, phone, password };
    users.push(newUser);
    setUsers(users);
    setCurrentUser(newUser);
    successEl.textContent = "Account created successfully.";
    successEl.style.display = "block";
    setTimeout(() => navigate("home"), 600);
  });
}

function bindReportPage() {
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("primary"));
      btn.classList.add("primary");
      document.getElementById("selectedCategory").value = btn.dataset.category;
    });
  });

  document.getElementById("reportForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const category = document.getElementById("selectedCategory").value;
    const description = document.getElementById("reportDescription").value.trim();
    const location = document.getElementById("reportLocation").value.trim();
    if (!category || !description || !location) return alert("Please complete all report fields.");
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]");
    reports.push({
      id: Date.now(),
      description,
      category,
      location,
      status: "Pending",
      date: new Date().toLocaleString()
    });
    localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(reports));
    alert("Report submitted successfully.");
    navigate("myreports");
  });
}

function loadReports() {
  const container = document.getElementById("reportsContainer");
  if (!container) return;
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]").reverse();
  if (!reports.length) {
    container.innerHTML = '<p style="text-align:center;">No complaints yet</p>';
    return;
  }
  container.innerHTML = reports.map(r => `<div class="report-card"><p><strong>${r.description}</strong></p><p>Category: ${r.category}</p><p>Location: ${r.location}</p><p>${r.date}</p><span class="badge">${r.status}</span></div>`).join("");
}

function bindSettings() {
  document.getElementById("settingsForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const fullName = document.getElementById("settingsFullName").value.trim();
    const phone = document.getElementById("settingsPhone").value.trim();
    const governorate = document.getElementById("settingsGovernorate").value.trim();
    const updated = { ...user, fullName, phone, governorate };
    setCurrentUser(updated);
    setUsers(getUsers().map(u => (u.nationalId === user.nationalId ? updated : u)));
    alert("Profile updated.");
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearCurrentUser();
    navigate("login");
  });
}

function bindQuickReport() {
  const pickMedia = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.capture = "environment";
    input.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;
      sessionStorage.setItem("ursa_pending_media_name", file.name);
      navigate("report");
    });
    input.click();
  };
  document.getElementById("quickReport")?.addEventListener("click", pickMedia);
  document.getElementById("cameraBox")?.addEventListener("click", pickMedia);
}

function guardAuth() {
  const page = document.body.dataset.page;
  const authPages = new Set(["login", "register"]);
  const user = getValidatedCurrentUser();
  if (!authPages.has(page) && !user) navigate("login");
  if (authPages.has(page) && user) navigate("home");
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "dark");
  bindLayout();
  bindAuthPages();
  guardAuth();
  populateUserData();
  updateGreeting();
  bindReportPage();
  bindSettings();
  bindQuickReport();
  loadReports();
  window.showPage = navigate;
  window.newReport = () => navigate("report");
});
