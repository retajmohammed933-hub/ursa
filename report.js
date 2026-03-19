// reports.js - Reports Management System
(function() {
    const STORAGE_KEYS = {
        REPORTS: 'ursa_reports',
        CURRENT_USER: 'ursa_current_user'
    };

    function getReports() {
        try {
            const reports = localStorage.getItem(STORAGE_KEYS.REPORTS);
            return reports ? JSON.parse(reports) : [];
        } catch (e) {
            return [];
        }
    }

    function saveReports(reports) {
        try {
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
            return true;
        } catch (e) {
            return false;
        }
    }

    function getCurrentUser() {
        try {
            const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    window.addReport = function(reportData) {
        const user = getCurrentUser();
        if (!user) {
            alert('Please login first');
            return false;
        }

        if (!reportData.description || !reportData.category) {
            alert('Please fill all required fields');
            return false;
        }

        try {
            const reports = getReports();
            
            const newReport = {
                id: 'REP-' + Date.now(),
                userId: user.nationalId || user.phone,
                userName: user.fullName || 'User',
                description: reportData.description,
                category: reportData.category,
                location: reportData.location || 'Benha',
                status: 'Under Review',
                date: new Date().toLocaleString()
            };

            reports.push(newReport);
            saveReports(reports);
            return true;
            
        } catch (error) {
            alert('Error saving report');
            return false;
        }
    };

    window.getUserReports = function() {
        const user = getCurrentUser();
        if (!user) return [];

        const reports = getReports();
        return reports.filter(r => r.userId === (user.nationalId || user.phone));
    };

    console.log('Reports system ready');
})();