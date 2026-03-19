(function () {
    function getUsers() {
        return JSON.parse(localStorage.getItem("ursa_users") || "[]");
    }

    function setUsers(users) {
        localStorage.setItem("ursa_users", JSON.stringify(users));
    }

    function setCurrentUser(user) {
        localStorage.setItem("ursa_current_user", JSON.stringify(user));
    }

    window.validateRegisterForm = function validateRegisterForm() {
        const fullName = document.getElementById("regFullName")?.value.trim();
        const nationalId = document.getElementById("regNationalId")?.value.trim();
        const governorate = document.getElementById("regGovernorate")?.value;
        const phone = document.getElementById("regPhone")?.value.trim();
        const password = document.getElementById("regPassword")?.value;
        const confirmPassword = document.getElementById("regConfirmPassword")?.value;

        if (!fullName || !nationalId || !governorate || !phone || !password || !confirmPassword) {
            alert("All fields are required.");
            return false;
        }

        if (!/^\d{14}$/.test(nationalId)) {
            alert("National ID must be exactly 14 digits.");
            return false;
        }

        if (!/^\d{11}$/.test(phone)) {
            alert("Phone number must be exactly 11 digits.");
            return false;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return false;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return false;
        }

        const users = getUsers();
        const exists = users.some(
            (user) => user.phone === phone || user.nationalId === nationalId
        );

        if (exists) {
            alert("This account already exists.");
            return false;
        }

        const userData = {
            fullName,
            nationalId,
            governorate,
            phone,
            password
        };

        users.push(userData);
        setUsers(users);
        setCurrentUser(userData);

        alert("Account created successfully.");
        return true;
    };
})();