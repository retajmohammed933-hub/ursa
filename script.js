// ==================== CONFIGURATION ====================
const STORAGE_KEY = 'complaints_list';

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    
    // Show selected page
    document.getElementById('page-' + pageName).classList.add('active-page');
    
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
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
    document.getElementById('location').value = 'Benha';
    
    // Go to Report page
    showPage('report');
}

// ==================== REFRESH BUTTON ====================
function refreshReports() {
    // Reload and display complaints
    loadAndDisplayReports();
    
    // Show feedback
    const message = document.getElementById('successMessage');
    message.textContent = '🔄 Reports refreshed!';
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 2000);
}

// ==================== LOAD AND DISPLAY REPORTS ====================
function loadAndDisplayReports() {
    const container = document.getElementById('reportsContainer');
    
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

    // Display complaints
    if (complaints.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No complaints yet</p>';
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
document.getElementById('reportForm').addEventListener('submit', function(event) {
    // Stop the form from submitting normally
    event.preventDefault();
    
    console.log('Submit button clicked!');

    // Get form values
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim() || 'Benha';

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
        location: location,
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
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);

    // Clear the form
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
    document.getElementById('location').value = 'Benha';

    // Go to My Reports page
    showPage('myreports');
});

// ==================== THEME TOGGLE ====================
document.getElementById('lightModeBtn').addEventListener('click', function() {
    document.body.classList.remove('dark');
    document.getElementById('lightModeBtn').classList.add('active');
    document.getElementById('darkModeBtn').classList.remove('active');
    localStorage.setItem('theme', 'light');
});

document.getElementById('darkModeBtn').addEventListener('click', function() {
    document.body.classList.add('dark');
    document.getElementById('darkModeBtn').classList.add('active');
    document.getElementById('lightModeBtn').classList.remove('active');
    localStorage.setItem('theme', 'dark');
});

// ==================== INITIAL LOAD ====================
window.onload = function() {
    console.log('System ready - All buttons working');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('darkModeBtn').classList.add('active');
        document.getElementById('lightModeBtn').classList.remove('active');
    } else {
        document.body.classList.remove('dark');
        document.getElementById('lightModeBtn').classList.add('active');
        document.getElementById('darkModeBtn').classList.remove('active');
    }
    
    showPage('report');
};