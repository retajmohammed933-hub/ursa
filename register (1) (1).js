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

  function clearMessages() {
    const errorDiv = document.getElementById("registerError");
    const successDiv = document.getElementById("registerSuccess");
    const passwordMatchError = document.getElementById("passwordMatchError");

    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.style.display = "none";
    }

    if (successDiv) {
      successDiv.textContent = "";
      successDiv.style.display = "none";
    }

    if (passwordMatchError) {
      passwordMatchError.style.display = "none";
    }
  }

  function showRegisterError(message) {
    const errorDiv = document.getElementById("registerError");
    if (!errorDiv) return false;

    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    return false;
  }

  window.validateRegisterForm = function validateRegisterForm() {
    clearMessages();

    const fullName = document.getElementById("regFullName")?.value.trim();
    const nationalId = document.getElementById("regNationalId")?.value.trim();
    const governorate = document.getElementById("regGovernorate")?.value;
    const phone = document.getElementById("regPhone")?.value.trim();
    const password = document.getElementById("regPassword")?.value;
    const confirmPassword = document.getElementById("regConfirmPassword")?.value;

    const successDiv = document.getElementById("registerSuccess");
    const passwordMatchError = document.getElementById("passwordMatchError");

    if (!fullName || !nationalId || !governorate || !phone || !password || !confirmPassword) {
      return showRegisterError("All fields are required.");
    }

    if (!/^\d{14}$/.test(nationalId)) {
      return showRegisterError("National ID must be exactly 14 digits.");
    }

    if (!/^\d{11}$/.test(phone)) {
      return showRegisterError("Phone number must be exactly 11 digits.");
    }

    if (password.length < 6) {
      return showRegisterError("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      if (passwordMatchError) passwordMatchError.style.display = "block";
      return false;
    }

    const users = getUsers();

    const exists = users.some(
      (user) => user.phone === phone || user.nationalId === nationalId
    );

    if (exists) {
      return showRegisterError("This account already exists.");
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

    if (successDiv) {
      successDiv.textContent = "Account created successfully.";
      successDiv.style.display = "block";
    }

    return true;
  };
})();