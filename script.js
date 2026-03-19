// ==================== CONFIGURATION ====================
const STORAGE_KEY = 'ursa_complaints';

// ==================== ORIGINAL FUNCTIONS (KEEP ALL) ====================

// Original getUsers function
function getUsers() {
    return JSON.parse(localStorage.getItem("ursa_users") || "[]");
}

// Original setUsers function
function setUsers(users) {
    localStorage.setItem("ursa_users", JSON.stringify(users));
}

// Original getCurrentUser function
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("ursa_current_user") || "null");
}

// Original setCurrentUser function
function setCurrentUser(user) {
    localStorage.setItem("ursa_current_user", JSON.stringify(user));
}

// Original clearCurrentUser function
function clearCurrentUser() {
    localStorage.removeItem("ursa_current_user");
}

// Original showPage function (modified to keep all original functionality)
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active-page"));

    // Show selected page
    const target = document.getElementById(`page-${pageName}`);
    if (target) target.classList.add("active-page");

    // Handle login page special class
    if (pageName === "login" || pageName === "register") {
        document.body.classList.add("login-page");
        closeSidebar();
    } else {
        document.body.classList.remove("login-page");
    }
    
    // If showing myreports, load complaints (NEW functionality)
    if (pageName === "myreports") {
        setTimeout(() => {
            if (typeof loadAndDisplayReports === 'function') {
                loadAndDisplayReports();
            }
        }, 100);
    }
    
    // If showing home, update user data (original functionality)
    if (pageName === "home") {
        if (typeof populateUserData === 'function') populateUserData();
        if (typeof updateGreeting === 'function') updateGreeting();
    }
}

// Original openSidebar function
function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("show");
}

// Original closeSidebar function
function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
}

// Original updateGreeting function
function updateGreeting() {
    const homeGreeting = document.getElementById("homeGreeting");
    if (!homeGreeting) return;

    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    homeGreeting.textContent = greeting;
}

// Original populateUserData function
function populateUserData() {
    const user = getCurrentUser();
    if (!user) return;

    const homeUserName = document.getElementById("homeUserName");
    const homeUserMeta = document.getElementById("homeUserMeta");
    const homeGovernorate = document.getElementById("homeGovernorate");
    const homePhone = document.getElementById("homePhone");
    const accountIdText = document.getElementById("accountIdText");
    const settingsFullName = document.getElementById("settingsFullName");
    const settingsPhone = document.getElementById("settingsPhone");
    const settingsGovernorate = document.getElementById("settingsGovernorate");

    if (homeUserName) homeUserName.textContent = user.fullName || "User Name";
    if (homeUserMeta) homeUserMeta.textContent = `National ID: ${user.nationalId || "-"}`;
    if (homeGovernorate) homeGovernorate.textContent = user.governorate || "Governorate";
    if (homePhone) homePhone.textContent = user.phone || "Phone";
    if (accountIdText) accountIdText.textContent = `National ID: ${user.nationalId || "-"}`;
    if (settingsFullName) settingsFullName.value = user.fullName || "";
    if (settingsPhone) settingsPhone.value = user.phone || "";
    if (settingsGovernorate) settingsGovernorate.value = user.governorate || "";
}

// Original applyTheme function
function applyTheme(mode) {
    const body = document.body;
    const lightModeBtn = document.getElementById("lightModeBtn");
    const darkModeBtn = document.getElementById("darkModeBtn");

    if (mode === "light") {
        body.classList.remove("dark");
        if (lightModeBtn) lightModeBtn.classList.add("active");
        if (darkModeBtn) darkModeBtn.classList.remove("active");
    } else {
        body.classList.add("dark");
        if (darkModeBtn) darkModeBtn.classList.add("active");
        if (lightModeBtn) lightModeBtn.classList.remove("active");
    }

    localStorage.setItem("ursa_theme", mode);
}

// Original login functions
function loginUser(identifier, password) {
    const users = getUsers();
    return users.find(
        (user) =>
            (user.phone === identifier || user.nationalId === identifier) &&
            user.password === password
    );
}

function handleLogin(event) {
    event.preventDefault();

    const loginError = document.getElementById("loginError");
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (loginError) {
        loginError.style.display = "none";
        loginError.textContent = "";
    }

    if (!identifier || !password) {
        if (loginError) {
            loginError.textContent = "Please enter your data correctly.";
            loginError.style.display = "block";
        }
        return;
    }

    const user = loginUser(identifier, password);

    if (!user) {
        if (loginError) {
            loginError.textContent = "Wrong phone / national ID or password.";
            loginError.style.display = "block";
        }
        return;
    }

    setCurrentUser(user);
    populateUserData();
    updateGreeting();
    showPage("home");
}

function handleRegister(event) {
    event.preventDefault();

    const ok = window.validateRegisterForm && window.validateRegisterForm();
    if (!ok) return;

    populateUserData();
    updateGreeting();
    showPage("home");

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.reset();
}

function handleSettingsUpdate(event) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById("settingsFullName").value.trim();
    const phone = document.getElementById("settingsPhone").value.trim();
    const governorate = document.getElementById("settingsGovernorate").value.trim();

    if (!fullName || !phone || !governorate) {
        alert("Please fill all profile fields.");
        return;
    }

    if (!/^\d{11}$/.test(phone)) {
        alert("Phone number must be exactly 11 digits.");
        return;
    }

    const users = getUsers();
    const duplicatePhone = users.some(
        (u) => u.phone === phone && u.nationalId !== user.nationalId
    );

    if (duplicatePhone) {
        alert("This phone number is already used by another account.");
        return;
    }

    const updatedUser = {
        ...user,
        fullName,
        phone,
        governorate
    };

    const updatedUsers = users.map((u) =>
        u.nationalId === user.nationalId ? updatedUser : u
    );

    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    populateUserData();
    alert("Profile updated successfully.");
}

function handleLogout() {
    clearCurrentUser();

    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.reset();

    showPage("login");
}

// Original category button function
function activateCategoryButton(button) {
    document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("primary");
    });

    button.classList.add("primary");

    const selectedCategory = document.getElementById("selectedCategory");
    if (selectedCategory) selectedCategory.value = button.dataset.category;
}

// Original camera functions
function clearCameraPreview() {
    const cameraPreview = document.getElementById("cameraPreview");
    const cameraInput = document.getElementById("cameraInput");
    
    if (cameraPreview) {
        cameraPreview.innerHTML = "";
        cameraPreview.classList.remove("active");
    }
    
    if (cameraInput) {
        cameraInput.value = "";
    }
}

function handleCameraFile(event) {
    const file = event.target.files && event.target.files[0];
    const preview = document.getElementById("cameraPreview");
    if (!file || !preview) return;

    const url = URL.createObjectURL(file);
    preview.innerHTML = "";

    if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        preview.appendChild(video);
    } else {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Captured preview";
        preview.appendChild(img);
    }

    preview.classList.add("active");
    showPage("report");
}

// ==================== NEW REPORT FUNCTIONS (ADD THIS) ====================

// New Report functions (these work with your new report tab)
function newReport() {
    // Clear the form
    const description = document.getElementById('description');
    const category = document.getElementById('category');
    const location = document.getElementById('location');
    
    if (description) description.value = '';
    if (category) category.value = '';
    if (location) location.value = 'Benha';
    
    // Go to Report page
    showPage('report');
}

function refreshReports() {
    // Reload and display complaints
    loadAndDisplayReports();
    
    // Show feedback
    const message = document.getElementById('successMessage');
    if (message) {
        message.textContent = '🔄 Reports refreshed!';
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    }
}

function loadAndDisplayReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;
    
    // Get complaints from localStorage
    let complaints = [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            complaints = JSON.parse(saved);
        }
    } catch (e) {
        console.log('Error loading complaints');
    }

    // Update stats if elements exist
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    
    if (totalCount) totalCount.textContent = complaints.length;
    if (pendingCount) pendingCount.textContent = complaints.filter(c => c.status === 'Pending').length;

    // Display complaints
    if (complaints.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No complaints yet</p>';
        return;
    }

    let html = '';
    complaints.reverse().forEach(complaint => {
        html += `
            <div class="report-card">
                <p><strong>📝 ${complaint.description}</strong></p>
                <p>🏷️ Category: ${complaint.category}</p>
                <p>📍 Location: ${complaint.location}</p>
                <p class="date">📅 ${complaint.date}</p>
                <span class="badge">⏳ ${complaint.status || 'Pending'}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupSubmitButton() {
    const form = document.getElementById('reportForm');
    if (!form) {
        console.log('Form not found');
        return;
    }

    // Remove any existing listeners to avoid duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(event) {
        // IMPORTANT: Stop page refresh
        event.preventDefault();
        
        console.log('✅ Submit button clicked!');

        // Get form elements
        const descriptionInput = document.getElementById('description');
        const categorySelect = document.getElementById('category');
        const locationInput = document.getElementById('location');

        // Check if elements exist
        if (!descriptionInput || !categorySelect) {
            alert('Form elements not found');
            return;
        }

        // Get values
        const description = descriptionInput.value.trim();
        const category = categorySelect.value;
        const location = locationInput ? locationInput.value.trim() : 'Benha';

        // Validate
        if (!description) {
            alert('Please enter a description');
            return;
        }
        if (!category) {
            alert('Please select a category');
            return;
        }

        // Create complaint object
        const newComplaint = {
            id: Date.now(),
            description: description,
            category: category,
            location: location || 'Benha',
            status: 'Pending',
            date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Save to localStorage
        let complaints = [];
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                complaints = JSON.parse(saved);
            }
        } catch (e) {
            complaints = [];
        }

        complaints.push(newComplaint);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));

        // Show success message
        const message = document.getElementById('successMessage');
        if (message) {
            message.style.display = 'block';
            setTimeout(() => {
                message.style.display = 'none';
            }, 3000);
        }

        // Clear the form
        descriptionInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (locationInput) locationInput.value = 'Benha';

        // Go to My Reports page
        showPage('myreports');
    });
}

// ==================== BIND ALL EVENTS ====================
function bindAppEvents() {
    // Original sidebar buttons
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const overlay = document.getElementById("overlay");
    const goToRegisterBtn = document.getElementById("goToRegister");
    const backToLoginBtn = document.getElementById("backToLogin");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const settingsForm = document.getElementById("settingsForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const quickReportBtn = document.getElementById("quickReport");
    const lightModeBtn = document.getElementById("lightModeBtn");
    const darkModeBtn = document.getElementById("darkModeBtn");
    const cameraBox = document.getElementById("cameraBox");
    const cameraInput = document.getElementById("cameraInput");

    // Original event listeners
    if (openSidebarBtn) openSidebarBtn.addEventListener("click", openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    // Original sidebar navigation
    document.querySelectorAll(".sidebar a[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const page = link.getAttribute("data-page");
            showPage(page);
            if (page === "home") {
                populateUserData();
                updateGreeting();
            }
            closeSidebar();
        });
    });

    // Original auth navigation
    if (goToRegisterBtn) {
        goToRegisterBtn.addEventListener("click", () => showPage("register"));
    }
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", () => showPage("login"));
    }

    // Original form handlers
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
    if (settingsForm) settingsForm.addEventListener("submit", handleSettingsUpdate);
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // Original category buttons
    document.querySelectorAll(".category-btn").forEach((button) => {
        button.addEventListener("click", () => activateCategoryButton(button));
    });

    // Original camera handlers
    if (quickReportBtn) {
        quickReportBtn.addEventListener("click", () => {
            showPage("report");
            if (cameraInput) cameraInput.click();
        });
    }
    if (cameraBox) {
        cameraBox.addEventListener("click", () => {
            if (cameraInput) cameraInput.click();
        });
    }
    if (cameraInput) {
        cameraInput.addEventListener("change", handleCameraFile);
    }

    // Original theme handlers
    if (lightModeBtn) lightModeBtn.addEventListener("click", () => applyTheme("light"));
    if (darkModeBtn) darkModeBtn.addEventListener("click", () => applyTheme("dark"));

    // NEW: Setup submit button for report form
    setupSubmitButton();
}

// ==================== INITIALIZE ====================
function initApp() {
    // Load saved theme
    const savedTheme = localStorage.getItem("ursa_theme") || "dark";
    applyTheme(savedTheme);

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        populateUserData();
        updateGreeting();
        showPage("home");
    } else {
        showPage("login");
    }

    // Bind all events
    bindAppEvents();
}

// Start everything when page loads
document.addEventListener("DOMContentLoaded", initApp);

// Make functions global for onclick handlers
window.showPage = showPage;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.newReport = newReport;
window.refreshReports = refreshReports;
window.activateCategoryButton = activateCategoryButton;
