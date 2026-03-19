// ==================== CONFIGURATION ====================
const STORAGE_KEY = 'ursa_complaints';

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    // Show selected page
    const page = document.getElementById('page-' + pageName);
    if (page) {
        page.classList.add('active-page');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(pageName)) {
            btn.classList.add('active');
        }
    });

    // If showing My Reports, load complaints
    if (pageName === 'myreports') {
        loadAndDisplayReports();
    }
}

// ==================== NEW REPORT BUTTON ====================
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

// ==================== REFRESH BUTTON ====================
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

// ==================== LOAD AND DISPLAY REPORTS ====================
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

// ==================== SUBMIT BUTTON ====================
function setupSubmitButton() {
    const form = document.getElementById('reportForm');
    if (!form) {
        console.log('Form not found');
        return;
    }

    form.addEventListener('submit', function(event) {
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

// ==================== SIDEBAR FUNCTIONS ====================
function setupSidebar() {
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('sidebar');

    if (openBtn) {
        openBtn.addEventListener('click', function() {
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('show');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            if (sidebar) sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // Sidebar navigation
    document.querySelectorAll('.sidebar a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        });
    });
}

// ==================== THEME TOGGLE ====================
function setupThemeToggle() {
    const lightBtn = document.getElementById('lightModeBtn');
    const darkBtn = document.getElementById('darkModeBtn');

    if (lightBtn) {
        lightBtn.addEventListener('click', function() {
            document.body.classList.remove('dark');
            lightBtn.classList.add('active');
            if (darkBtn) darkBtn.classList.remove('active');
            localStorage.setItem('ursa_theme', 'light');
        });
    }

    if (darkBtn) {
        darkBtn.addEventListener('click', function() {
            document.body.classList.add('dark');
            darkBtn.classList.add('active');
            if (lightBtn) lightBtn.classList.remove('active');
            localStorage.setItem('ursa_theme', 'dark');
        });
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('ursa_theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (darkBtn) darkBtn.classList.add('active');
        if (lightBtn) lightBtn.classList.remove('active');
    } else {
        document.body.classList.remove('dark');
        if (lightBtn) lightBtn.classList.add('active');
        if (darkBtn) darkBtn.classList.remove('active');
    }
}

// ==================== INITIALIZE EVERYTHING ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 System starting...');
    
    // Setup all functionality
    setupSubmitButton();
    setupSidebar();
    setupThemeToggle();
    
    // Show report page by default
    showPage('report');
    
    console.log('✅ System ready - Submit button working!');
});

// Make functions global for onclick handlers
window.showPage = showPage;
window.newReport = newReport;
window.refreshReports = refreshReports;
