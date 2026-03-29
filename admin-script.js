// ==================== CONSTANTS ====================
const ADMIN_STORAGE_KEYS = {
  users: "ursa_users",
  complaints: "ursa_complaints",
  adminSession: "ursa_admin_logged_in",
  theme: "ursa_theme"
};

const ADMIN_PASSWORD = "admin123";

// ==================== LAYOUT INJECTION ====================
function injectAdminLayout() {
  const isLoginPage = window.location.pathname.includes('admin-login.html');

  if (!isLoginPage) {
    const sidebarHTML = `
      <div class="overlay" id="overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="close-btn" id="closeSidebar">&times;</div>
        <ul>
          <li><a href="admin-home.html" data-nav="admin-home.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
          <li><a href="admin-users.html" data-nav="admin-users.html"><i class="fas fa-users"></i> Users</a></li>
          <li><a href="admin-reports.html" data-nav="admin-reports.html"><i class="fas fa-list"></i> Reports</a></li>
          <li><a href="admin-settings.html" data-nav="admin-settings.html"><i class="fas fa-gear"></i> Settings</a></li>
          <li><a href="#" id="adminLogoutLink"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
      </aside>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  const topBarHTML = `
    <div class="top-bar">
      <div class="logo-area">
        ${!isLoginPage ? '<div class="hamburger" id="openSidebar"><i class="fas fa-bars"></i></div>' : ''}
        <div class="logo-container">
          <div class="logo-image"><img src="URSA 3.png" alt="URSA Logo" /></div>
          <div class="logo">URSA · ADMIN</div>
        </div>
      </div>
      <div class="theme-toggle">
        <i class="fas fa-sun" id="lightModeBtn"></i>
        <i class="fas fa-moon active" id="darkModeBtn"></i>
      </div>
    </div>
  `;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertAdjacentHTML('beforebegin', topBarHTML);
  } else {
    document.body.insertAdjacentHTML('afterbegin', topBarHTML);
  }

  // Set Active Nav
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar a[data-nav]').forEach(link => {
    if (link.getAttribute('data-nav') === currentPath) {
      link.classList.add('active-nav');
    }
  });

  // Logout event
  document.getElementById('adminLogoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    adminLogout();
  });
}

// ==================== AUTH FUNCTIONS ====================
function adminLogin() {
  const passwordInput = document.getElementById('adminPassword');
  const errorDiv = document.getElementById('adminError');
  
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_STORAGE_KEYS.adminSession, "true");
    window.location.href = 'admin-home.html';
  } else {
    if (errorDiv) {
      errorDiv.textContent = 'Invalid password';
      errorDiv.style.display = 'block';
      setTimeout(() => errorDiv.style.display = 'none', 3000);
    }
  }
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_STORAGE_KEYS.adminSession);
  window.location.href = 'admin-login.html';
}

function checkAdminAuth() {
  const isLoggedIn = sessionStorage.getItem(ADMIN_STORAGE_KEYS.adminSession);
  const isLoginPage = window.location.pathname.includes('admin-login.html');
  
  if (!isLoggedIn && !isLoginPage) {
    window.location.href = 'admin-login.html';
  }
}

// ==================== DATA FUNCTIONS ====================
function getAllUsers() {
  return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEYS.users) || "[]");
}

function getAllReports() {
  return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEYS.complaints) || "[]");
}

function deleteUser(nationalId) {
  if (confirm('Are you sure you want to delete this user?')) {
    let users = getAllUsers();
    users = users.filter(u => u.nationalId !== nationalId);
    localStorage.setItem(ADMIN_STORAGE_KEYS.users, JSON.stringify(users));
    loadAdminUsers();
    updateAdminStats();
  }
}

function deleteReport(id) {
  if (confirm('Are you sure you want to delete this report?')) {
    let reports = getAllReports();
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(ADMIN_STORAGE_KEYS.complaints, JSON.stringify(reports));
    loadAdminReports();
    updateAdminStats();
  }
}

function updateReportStatus(id, newStatus) {
  let reports = getAllReports();
  const reportIndex = reports.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    reports[reportIndex].status = newStatus;
    localStorage.setItem(ADMIN_STORAGE_KEYS.complaints, JSON.stringify(reports));
    loadAdminReports();
    updateAdminStats();
  }
}

function showReportImage(imageUrl) {
  if (!imageUrl) return;
  const modal = document.createElement('div');
  modal.className = 'overlay show';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '3000'; // Very high z-index
  modal.onclick = () => modal.remove();
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.borderRadius = '20px';
  img.style.boxShadow = '0 0 50px rgba(0,0,0,0.8)';
  img.style.border = '2px solid var(--primary)';
  
  // Add a close hint
  const hint = document.createElement('div');
  hint.innerHTML = 'Click anywhere to close';
  hint.style.position = 'absolute';
  hint.style.bottom = '20px';
  hint.style.color = 'white';
  hint.style.background = 'rgba(0,0,0,0.5)';
  hint.style.padding = '5px 15px';
  hint.style.borderRadius = '20px';
  
  modal.appendChild(img);
  modal.appendChild(hint);
  document.body.appendChild(modal);
}

function openEditUserModal(nationalId) {
  const users = getAllUsers();
  const user = users.find(u => u.nationalId === nationalId);
  if (!user) return;

  const modal = document.createElement('div');
  modal.className = 'overlay show';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '2000';
  
  const card = document.createElement('div');
  card.className = 'glass-card';
  card.style.width = '450px';
  card.style.padding = '40px';
  card.innerHTML = `
    <h2 style="margin-bottom: 20px;"><i class="fas fa-user-edit" style="color: var(--primary);"></i> Edit User Profile</h2>
    <form id="editUserForm">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Full Name</label>
        <input class="glass-input" type="text" id="editFullName" value="${user.fullName}" style="margin-bottom: 0;">
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Phone Number</label>
        <input class="glass-input" type="text" id="editPhone" value="${user.phone}" style="margin-bottom: 0;">
      </div>
      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Governorate</label>
        <input class="glass-input" type="text" id="editGovernorate" value="${user.governorate}" style="margin-bottom: 0;">
      </div>
      <div style="display: flex; gap: 15px;">
        <button type="submit" class="glass-btn primary" style="flex: 2; padding: 12px;"><i class="fas fa-save"></i> Save Changes</button>
        <button type="button" class="glass-btn" style="flex: 1; padding: 12px;" onclick="this.closest('.overlay').remove()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </form>
  `;
  
  modal.appendChild(card);
  document.body.appendChild(modal);

  card.querySelector('#editUserForm').onsubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      fullName: document.getElementById('editFullName').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      governorate: document.getElementById('editGovernorate').value.trim()
    };

    if (!updatedUser.fullName || !updatedUser.phone || !updatedUser.governorate) {
      alert('All fields are required');
      return;
    }
    
    const allUsers = getAllUsers();
    const index = allUsers.findIndex(u => u.nationalId === nationalId);
    allUsers[index] = updatedUser;
    localStorage.setItem(ADMIN_STORAGE_KEYS.users, JSON.stringify(allUsers));
    
    // Also update currentUser if it's the same person
    const currentUser = JSON.parse(localStorage.getItem('ursa_current_user'));
    if (currentUser && currentUser.nationalId === nationalId) {
      localStorage.setItem('ursa_current_user', JSON.stringify(updatedUser));
    }

    modal.remove();
    loadAdminUsers();
    alert('✅ User updated successfully!');
  };
}

// ==================== UI FUNCTIONS ====================
function updateAdminStats() {
  const users = getAllUsers();
  const reports = getAllReports();
  
  const totalUsersEl = document.getElementById('totalUsers');
  const totalReportsEl = document.getElementById('totalReports');
  const pendingReportsEl = document.getElementById('pendingReports');
  const resolvedReportsEl = document.getElementById('resolvedReports');
  
  if (totalUsersEl) totalUsersEl.textContent = users.length;
  if (totalReportsEl) totalReportsEl.textContent = reports.length;
  if (pendingReportsEl) pendingReportsEl.textContent = reports.filter(r => r.status === 'Pending').length;
  if (resolvedReportsEl) resolvedReportsEl.textContent = reports.filter(r => r.status === 'Resolved').length;
}

function loadAdminUsers() {
  const container = document.getElementById('usersList');
  if (!container) return;
  
  const users = getAllUsers();
  if (users.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-users-slash"></i><br>No users registered yet</div>';
    return;
  }
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>National ID</th>
          <th>Phone</th>
          <th>Governorate</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  users.forEach(user => {
    html += `
      <tr>
        <td>${user.fullName}</td>
        <td>${user.nationalId}</td>
        <td>${user.phone}</td>
        <td>${user.governorate}</td>
        <td>
          <button class="action-btn delete-btn" onclick="deleteUser('${user.nationalId}')"><i class="fas fa-trash"></i> Delete</button>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

function loadAdminReports() {
  const container = document.getElementById('reportsList');
  if (!container) return;
  
  const reports = getAllReports();
  if (reports.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><br>No reports submitted yet</div>';
    return;
  }
  
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Category</th>
          <th>Description</th>
          <th>Location</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  reports.reverse().forEach(report => {
    let statusClass = '';
    if (report.status === 'Pending') statusClass = 'status-pending';
    else if (report.status === 'In Progress') statusClass = 'status-inprogress';
    else statusClass = 'status-resolved';
    
    html += `
      <tr data-id="${report.id}">
        <td>${report.id}</td>
        <td>${report.category}</td>
        <td title="${report.description}">${report.description.substring(0, 30)}${report.description.length > 30 ? '...' : ''}</td>
        <td>${report.location}</td>
        <td>${report.date}</td>
        <td>
          <span class="status-badge ${statusClass}">${report.status}</span>
          ${report.image ? `<br><button class="action-btn view-img-btn" style="background: var(--secondary); color: white; margin-top: 5px;"><i class="fas fa-image"></i> View Photo</button>` : ''}
        </td>
        <td>
          <select class="status-select" onchange="updateReportStatus(${report.id}, this.value)">
            <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${report.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button class="action-btn delete-btn" onclick="deleteReport(${report.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;

  // Add event listeners for image viewing
  container.querySelectorAll('.view-img-btn').forEach(btn => {
    btn.onclick = () => {
      const reportId = parseInt(btn.closest('tr').dataset.id);
      const report = reports.find(r => r.id === reportId);
      if (report && report.image) {
        showReportImage(report.image);
      }
    };
  });
}

// ==================== SIDEBAR FUNCTIONS ====================
function openAdminSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("show");
}

function closeAdminSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

// ==================== THEME FUNCTIONS ====================
function applyAdminTheme(mode) {
  const body = document.body;
  if (mode === "light") {
    body.classList.remove("dark");
  } else {
    body.classList.add("dark");
  }
  localStorage.setItem(ADMIN_STORAGE_KEYS.theme, mode);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Inject layout
  injectAdminLayout();
  
  checkAdminAuth();
  
  const savedTheme = localStorage.getItem(ADMIN_STORAGE_KEYS.theme) || 'dark';
  applyAdminTheme(savedTheme);
  
  // Stats
  updateAdminStats();
  
  // Data lists
  if (window.location.pathname.includes('admin-users.html')) {
    loadAdminUsers();
  }
  if (window.location.pathname.includes('admin-reports.html')) {
    loadAdminReports();
  }
  
  // Sidebar events
  document.getElementById('openSidebar')?.addEventListener('click', openAdminSidebar);
  document.getElementById('closeSidebar')?.addEventListener('click', closeAdminSidebar);
  document.getElementById('overlay')?.addEventListener('click', closeAdminSidebar);
  
  // Theme toggle events
  document.getElementById('lightModeBtn')?.addEventListener('click', () => applyAdminTheme('light'));
  document.getElementById('darkModeBtn')?.addEventListener('click', () => applyAdminTheme('dark'));
});
