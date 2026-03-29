// ==================== CONSTANTS ====================
const STORAGE_KEYS = {
  users: "ursa_users",
  currentUser: "ursa_current_user",
  theme: "ursa_theme",
  complaints: "ursa_complaints"
};

// ==================== USER FUNCTIONS ====================
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

// ==================== LAYOUT INJECTION = :root ====================
function injectLayout() {
  const isLoginPage = window.location.pathname.includes('login.html') || 
                     window.location.pathname.includes('register.html') || 
                     window.location.pathname.endsWith('index.html');

  // Skip sidebar for login/register
  if (!isLoginPage) {
    const sidebarHTML = `
      <div class="overlay" id="overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="close-btn" id="closeSidebar">&times;</div>
        <ul>
          <li><a href="home.html" data-nav="home.html"><i class="fas fa-house"></i> Home</a></li>
          <li><a href="report.html" data-nav="report.html"><i class="fas fa-camera"></i> Report</a></li>
          <li><a href="myreports.html" data-nav="myreports.html"><i class="fas fa-clipboard-list"></i> My Reports</a></li>
          <li><a href="map.html" data-nav="map.html"><i class="fas fa-map-location-dot"></i> Map</a></li>
          <li><a href="emergency.html" data-nav="emergency.html"><i class="fas fa-triangle-exclamation"></i> Emergency</a></li>
          <li><a href="settings.html" data-nav="settings.html"><i class="fas fa-gear"></i> Settings</a></li>
        </ul>
      </aside>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // Top Bar (always present but different icons)
  const topBarHTML = `
    <div class="top-bar">
      <div class="logo-area">
        ${!isLoginPage ? '<div class="hamburger" id="openSidebar"><i class="fas fa-bars"></i></div>' : ''}
        <div class="logo-container">
          <div class="logo-image"><img src="URSA 3.png" alt="URSA Logo" /></div>
          <div class="logo">URSA</div>
        </div>
      </div>
      <div class="theme-toggle">
        <i class="fas fa-sun" id="lightModeBtn"></i>
        <i class="fas fa-moon active" id="darkModeBtn"></i>
      </div>
    </div>
  `;
  
  // Inject before container if it exists
  const container = document.querySelector('.container');
  if (container) {
    container.insertAdjacentHTML('beforebegin', topBarHTML);
  } else {
    document.body.insertAdjacentHTML('afterbegin', topBarHTML);
  }

  // Set Active Nav
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a[data-nav]').forEach(link => {
    if (link.getAttribute('data-nav') === currentPath) {
      link.classList.add('active-nav');
    }
  });
}

// ==================== UI FUNCTIONS ====================
function updateGreeting() {
  const homeGreeting = document.getElementById("homeGreeting");
  if (!homeGreeting) return;
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  homeGreeting.textContent = greeting;
}

function populateUserData() {
  const user = getCurrentUser();
  if (!user) return;
  
  const elements = {
    homeUserName: "fullName",
    homeUserMeta: "nationalId",
    homeGovernorate: "governorate",
    homePhone: "phone",
    accountIdText: "nationalId",
    settingsFullName: "fullName",
    settingsPhone: "phone",
    settingsGovernorate: "governorate"
  };

  for (const [id, key] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "INPUT") {
        el.value = user[key] || "";
      } else if (id === "homeUserMeta" || id === "accountIdText") {
        el.textContent = `National ID: ${user[key] || "-"}`;
      } else {
        el.textContent = user[key] || (id.includes("Name") ? "User Name" : "");
      }
    }
  }
}

// ==================== THEME FUNCTIONS ====================
function applyTheme(mode) {
  const body = document.body;
  const lightModeBtn = document.getElementById("lightModeBtn");
  const darkModeBtn = document.getElementById("darkModeBtn");
  if (mode === "light") {
    body.classList.remove("dark");
    lightModeBtn?.classList.add("active");
    darkModeBtn?.classList.remove("active");
  } else {
    body.classList.add("dark");
    darkModeBtn?.classList.add("active");
    lightModeBtn?.classList.remove("active");
  }
  localStorage.setItem(STORAGE_KEYS.theme, mode);
}

// ==================== SIDEBAR FUNCTIONS ====================
function openSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("show");
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

// ==================== IMAGE UPLOAD FUNCTIONS ====================
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById('cameraPreview');
  const removeBtn = document.getElementById('removePhotoBtn');
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const dataUrl = event.target.result;
    window.lastCapturedImageData = dataUrl;
    
    if (preview) {
      preview.innerHTML = `<img src="${dataUrl}" style="width: 100%; border-radius: 24px;">`;
      preview.classList.add('active');
    }
    if (removeBtn) removeBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeSelectedPhoto() {
  window.lastCapturedImageData = null;
  const preview = document.getElementById('cameraPreview');
  const removeBtn = document.getElementById('removePhotoBtn');
  const fileInput = document.getElementById('cameraFileInput');
  
  if (preview) {
    preview.innerHTML = '';
    preview.classList.remove('active');
  }
  if (removeBtn) removeBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

// ==================== REPORT FUNCTIONS ====================
function activateCategoryButton(button) {
  document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("primary"));
  button.classList.add("primary");
  const selectedCategoryInput = document.getElementById("selectedCategory");
  if (selectedCategoryInput) selectedCategoryInput.value = button.dataset.category;
}

function handleReportSubmit(event) {
  event.preventDefault();
  const category = document.getElementById("selectedCategory").value;
  const description = document.getElementById("reportDescription").value.trim();
  const location = document.getElementById("reportlocation").value.trim() || "Benha";

  if (!category) { alert("⚠️ Please select a category."); return; }
  if (!description) { alert("⚠️ Please write a description."); return; }

  const user = getCurrentUser();
  if (!user) { alert("❌ Please login first."); window.location.href = "login.html"; return; }

  const complaint = {
    id: Date.now(),
    description: description,
    category: category,
    location: location,
    status: "Pending",
    image: window.lastCapturedImageData || null, // Add the image data
    date: new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  };

  let complaints = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || '[]');
  complaints.push(complaint);
  localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(complaints));

  alert('✅ Report submitted successfully!');
  window.lastCapturedImageData = null; // Clear after submit
  window.location.href = 'myreports.html';
}

function loadReports() {
  const container = document.getElementById('reportsContainer');
  if (!container) return;
  const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.complaints) || '[]');
  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No complaints yet</p>';
    return;
  }
  let html = '';
  reports.reverse().forEach(r => {
    html += `<div class="report-card"><p><strong>📝 ${r.description}</strong></p><p>🏷️ Category: ${r.category}</p><p>📍 Location: ${r.location}</p><p class="date">📅 ${r.date}</p><span class="badge">⏳ ${r.status}</span></div>`;
  });
  container.innerHTML = html;
}

// ==================== AUTH HANDLERS ====================
function handleLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  const users = getUsers();
  const user = users.find(u => (u.phone === identifier || u.nationalId === identifier) && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    window.location.href = 'home.html';
  } else {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = 'Wrong credentials';
      errorEl.style.display = 'block';
    }
  }
}

function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const nationalId = document.getElementById('regNationalId').value.trim();
  const governorate = document.getElementById('regGovernorate').value;
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('regConfirmPassword').value;

  const errorEl = document.getElementById('registerError');
  const showErr = (msg) => { if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; } };

  if (!fullName || !nationalId || !governorate || !phone || !password || !confirmPass) {
    showErr("All fields are required."); return;
  }

  if (!/^\d{14}$/.test(nationalId)) {
    showErr("National ID must be exactly 14 digits."); return;
  }

  if (!/^\d{11}$/.test(phone)) {
    showErr("Phone number must be exactly 11 digits."); return;
  }

  if (password.length < 6) {
    showErr("Password must be at least 6 characters."); return;
  }

  if (password !== confirmPass) {
    const passMatchErr = document.getElementById('passwordMatchError');
    if (passMatchErr) passMatchErr.style.display = 'block';
    return;
  }
  
  const users = getUsers();
  if (users.some(u => u.phone === phone || u.nationalId === nationalId)) {
    showErr('User already exists');
    return;
  }

  const newUser = { fullName, nationalId, governorate, phone, password };
  users.push(newUser);
  setUsers(users);
  setCurrentUser(newUser);
  
  const successEl = document.getElementById('registerSuccess');
  if (successEl) { successEl.textContent = 'Account created!'; successEl.style.display = 'block'; }
  setTimeout(() => window.location.href = 'home.html', 1000);
}

function handleSettingsUpdate(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const fullName = document.getElementById('settingsFullName').value.trim();
  const phone = document.getElementById('settingsPhone').value.trim();
  const governorate = document.getElementById('settingsGovernorate').value.trim();
  
  if (!fullName || !phone || !governorate) { alert('Please fill all fields'); return; }
  
  const users = getUsers();
  const updatedUser = { ...user, fullName, phone, governorate };
  const updatedUsers = users.map(u => u.nationalId === user.nationalId ? updatedUser : u);
  setUsers(updatedUsers);
  setCurrentUser(updatedUser);
  alert('Profile updated');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Inject layout (Sidebar, Top Bar)
  injectLayout();

  // Theme initialization
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  applyTheme(savedTheme);

  // Auth check for non-login/register pages
  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html') || window.location.pathname.endsWith('/');
  const user = getCurrentUser();

  if (!user && !isAuthPage && !window.location.pathname.includes('index.html')) {
    window.location.href = 'login.html';
    return;
  }

  // Sidebar events
  document.getElementById('openSidebar')?.addEventListener('click', openSidebar);
  document.getElementById('closeSidebar')?.addEventListener('click', closeSidebar);
  document.getElementById('overlay')?.addEventListener('click', closeSidebar);

  // Theme toggle events
  document.getElementById('lightModeBtn')?.addEventListener('click', () => applyTheme('light'));
  document.getElementById('darkModeBtn')?.addEventListener('click', () => applyTheme('dark'));

  // Page specific initializations
  if (user) {
    populateUserData();
    updateGreeting();
  }

  if (window.location.pathname.includes('myreports.html')) {
    loadReports();
  }

  // Form event listeners
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('reportForm')?.addEventListener('submit', handleReportSubmit);
  document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsUpdate);

  // Image upload events
  document.getElementById('uploadButton')?.addEventListener('click', () => {
    document.getElementById('cameraFileInput')?.click();
  });
  document.getElementById('cameraFileInput')?.addEventListener('change', handleImageSelect);
  document.getElementById('removePhotoBtn')?.addEventListener('click', removeSelectedPhoto);
  
  // Category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => activateCategoryButton(btn));
  });

  // Quick report button on Home
  document.getElementById('quickReportBtn')?.addEventListener('click', () => {
    window.location.href = 'report.html?autoOpen=true';
  });

  // Auto-open gallery if requested
  if (window.location.pathname.includes('report.html') && new URLSearchParams(window.location.search).get('autoOpen') === 'true') {
    setTimeout(() => {
      document.getElementById('cameraFileInput')?.click();
    }, 500);
  }

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = 'login.html';
  });

  // Navigation from login/register
  document.getElementById('goToRegister')?.addEventListener('click', () => window.location.href = 'register.html');
  document.getElementById('backToLogin')?.addEventListener('click', () => window.location.href = 'login.html');
});
