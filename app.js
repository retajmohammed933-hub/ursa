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
  settings: "settings.html",
  admin: "admin.html",
  adminsettings: "admin-settings.html"
};

const ADMIN_ACCOUNT = {
  fullName: "System Admin",
  email: "admin@ursa.local",
  phone: "00000000000",
  nationalId: "00000000000",
  governorate: "Admin",
  password: "00000",
  isAdmin: true
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

function ensureAdminAccount() {
  const users = getUsers();
  const existingAdmin = users.find(
    u => u.isAdmin || u.email === ADMIN_ACCOUNT.email || u.phone === ADMIN_ACCOUNT.phone || u.nationalId === ADMIN_ACCOUNT.nationalId
  );
  if (existingAdmin) {
    if (!existingAdmin.isAdmin) {
      existingAdmin.isAdmin = true;
      setUsers(users);
    }
    return;
  }
  users.push({ ...ADMIN_ACCOUNT });
  setUsers(users);
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
  document.getElementById("homeAvatar") && (document.getElementById("homeAvatar").textContent = (user.fullName || "U").trim().charAt(0).toUpperCase());
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
      closeSidebar();
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
    const user = getUsers().find(
      u => (u.phone === identifier || u.nationalId === identifier || u.email === identifier) && u.password === password
    );
    if (!user) {
      const err = document.getElementById("loginError");
      err.textContent = "Wrong credentials";
      err.style.display = "block";
      return;
    }
    setCurrentUser(user);
    navigate(user.isAdmin ? "admin" : "home");
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
    if (users.some(u => u.phone === phone || u.nationalId === nationalId || u.email === phone || u.email === nationalId)) {
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
    const user = getValidatedCurrentUser();
    if (!user) return navigate("login");
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
      userNationalId: user.nationalId,
      userPhone: user.phone,
      userName: user.fullName,
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
  const user = getValidatedCurrentUser();
  const allReports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]");
  const reports = allReports
    .filter(r => !user || r.userNationalId === user.nationalId)
    .reverse();
  if (!reports.length) {
    container.innerHTML = '<div class="empty-state"><h3>No reports yet</h3><p>Your complaint history will appear here after you submit the first report.</p></div>';
    return;
  }
  container.innerHTML = reports.map(r => `
    <div class="report-card">
      <strong>${r.description}</strong>
      <p>${r.category}</p>
      <div class="report-meta">
        <span><i class="fas fa-location-dot"></i> ${r.location}</span>
        <span><i class="fas fa-clock"></i> ${r.date}</span>
      </div>
      <span class="badge">${r.status}</span>
    </div>
  `).join("");
}

function updateReportStatus(reportId, status) {
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]");
  const updated = reports.map(r => (String(r.id) === String(reportId) ? { ...r, status } : r));
  localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(updated));
}

function deleteReport(reportId) {
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]");
  const filtered = reports.filter(r => String(r.id) !== String(reportId));
  localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(filtered));
}

function deleteUser(nationalId) {
  const users = getUsers().filter(u => u.nationalId !== nationalId || u.isAdmin);
  setUsers(users);
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]");
  const filteredReports = reports.filter(r => r.userNationalId !== nationalId);
  localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(filteredReports));
}

function bindAdminPage() {
  const reportsContainer = document.getElementById("adminReportsContainer");
  const usersContainer = document.getElementById("adminUsersContainer");
  if (!reportsContainer && !usersContainer) return;

  const render = () => {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || "[]").reverse();
    const users = getUsers().filter(u => !u.isAdmin);

    if (reportsContainer) {
      reportsContainer.innerHTML = reports.length
        ? reports.map(r => `
          <div class="report-card">
            <strong>${r.description}</strong>
            <p>${r.category} - <span class="field-hint">${r.status}</span></p>
            <div class="report-meta">
              <span><i class="fas fa-user"></i> ${r.userName || "Unknown user"}</span>
              <span><i class="fas fa-id-card"></i> ${r.userNationalId || "-"}</span>
            </div>
            <div class="report-meta">
              <span><i class="fas fa-location-dot"></i> ${r.location}</span>
              <span><i class="fas fa-clock"></i> ${r.date}</span>
            </div>
            <div class="button-row">
              <button type="button" class="glass-btn" data-action="status" data-id="${r.id}" data-status="Processing">Processing</button>
              <button type="button" class="glass-btn primary" data-action="status" data-id="${r.id}" data-status="Approved">Approve</button>
              <button type="button" class="glass-btn" data-action="status" data-id="${r.id}" data-status="Denied">Deny</button>
              <button type="button" class="glass-btn" data-action="delete-report" data-id="${r.id}">Delete</button>
            </div>
          </div>
        `).join("")
        : '<div class="empty-state"><h3>No reports yet</h3><p>Reports submitted by users will appear here.</p></div>';
    }

    if (usersContainer) {
      usersContainer.innerHTML = users.length
        ? users.map(u => {
          const ownedReports = reports.filter(r => r.userNationalId === u.nationalId);
          const reportItems = ownedReports.length
            ? ownedReports.map(r => `<p><strong>${r.category}</strong> - ${r.status} - ${r.location}</p>`).join("")
            : '<p class="field-hint">No reports from this user yet.</p>';
          return `
            <div class="report-card">
              <strong>${u.fullName}</strong>
              <p>Phone: ${u.phone}</p>
              <p>National ID: ${u.nationalId}</p>
              <div class="kpi-item"><strong>${ownedReports.length}</strong><span>User reports</span></div>
              <div>${reportItems}</div>
              <div class="button-row">
                <button type="button" class="glass-btn" data-action="delete-user" data-nationalid="${u.nationalId}">Delete user and reports</button>
              </div>
            </div>
          `;
        }).join("")
        : '<div class="empty-state"><h3>No user accounts</h3><p>Registered users will appear here.</p></div>';
    }
  };

  document.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "status") {
      updateReportStatus(btn.dataset.id, btn.dataset.status);
      render();
    } else if (action === "delete-report") {
      deleteReport(btn.dataset.id);
      render();
    } else if (action === "delete-user") {
      deleteUser(btn.dataset.nationalid);
      render();
    }
  });

  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    clearCurrentUser();
    navigate("login");
  });

  render();
}

function bindAdminSettings() {
  const form = document.getElementById("adminSettingsForm");
  if (!form) return;
  const user = getValidatedCurrentUser();
  if (!user || !user.isAdmin) return navigate("login");

  document.getElementById("adminEmail") && (document.getElementById("adminEmail").value = user.email || "");
  document.getElementById("adminPhone") && (document.getElementById("adminPhone").value = user.phone || "");
  document.getElementById("adminNationalId") && (document.getElementById("adminNationalId").value = user.nationalId || "");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const users = getUsers();
    const current = getValidatedCurrentUser();
    if (!current) return;
    const updated = {
      ...current,
      email: document.getElementById("adminEmail").value.trim(),
      phone: document.getElementById("adminPhone").value.trim(),
      nationalId: document.getElementById("adminNationalId").value.trim()
    };
    const nextUsers = users.map(u => (u.isAdmin ? { ...u, ...updated, isAdmin: true } : u));
    setUsers(nextUsers);
    setCurrentUser(updated);
    alert("Admin settings updated.");
  });
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
  const renderPendingMedia = () => {
    const preview = document.getElementById("cameraPreview");
    const mediaName = sessionStorage.getItem("ursa_pending_media_name");
    if (!preview || !mediaName) return;
    preview.classList.add("active");
    preview.innerHTML = `<div class="report-card"><strong>Attached media</strong><p>${mediaName}</p></div>`;
  };

  const pickMedia = useCamera => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    if (useCamera) input.capture = "environment";
    input.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;
      sessionStorage.setItem("ursa_pending_media_name", file.name);
      navigate("report");
    });
    input.click();
  };

  document.getElementById("uploadMediaBtn")?.addEventListener("click", () => {
    pickMedia(false);
  });
  document.getElementById("captureMediaBtn")?.addEventListener("click", () => {
    pickMedia(true);
  });

  document.getElementById("quickReport")?.addEventListener("click", () => pickMedia(false));
  renderPendingMedia();
}

function guardAuth() {
  const page = document.body.dataset.page;
  const authPages = new Set(["login", "register"]);
  const adminPages = new Set(["admin", "adminsettings"]);
  const user = getValidatedCurrentUser();
  if (!authPages.has(page) && !user) return navigate("login");
  if (adminPages.has(page) && !user?.isAdmin) return navigate("home");
  if (!adminPages.has(page) && user?.isAdmin && !authPages.has(page)) return navigate("admin");
  if (authPages.has(page) && user) return navigate(user.isAdmin ? "admin" : "home");
}

document.addEventListener("DOMContentLoaded", () => {
  ensureAdminAccount();
  applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "dark");
  bindLayout();
  bindAuthPages();
  guardAuth();
  populateUserData();
  updateGreeting();
  bindReportPage();
  bindSettings();
  bindAdminPage();
  bindAdminSettings();
  bindQuickReport();
  loadReports();
  window.showPage = navigate;
  window.newReport = () => navigate("report");
});
