// --- DOM Elements ---
const formLoginBB = document.getElementById("Login");
const emailBB = document.getElementById("email");
const passwordBB = document.getElementById("password");

// --- Helper Functions ---
const isRequired = (value) => (value === "" ? false : true);

const isEmailValid = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
};

const showError = (input, message) => {
    const formField = input.parentElement;
    formField.classList.remove("success");
    formField.classList.add("error");
    const error = formField.querySelector("small");
    if (error) {
        error.textContent = message;
    }
};

const showSuccess = (input) => {
    const formField = input.parentElement;
    formField.classList.remove("error");
    formField.classList.add("success");
    const error = formField.querySelector("small");
    if (error) {
        error.textContent = "";
    }
};

const showLoginAlert = (message, isSuccess = false) => {
    let alertBox = document.getElementById("loginAlert");
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "loginAlert";
        formLoginBB.insertAdjacentElement("beforebegin", alertBox);
    }
    alertBox.className = isSuccess ? "alert-success" : "alert-error";
    alertBox.textContent = message;
    alertBox.style.display = "block";

    if (!isSuccess) {
        setTimeout(() => {
            alertBox.style.display = "none";
        }, 4000);
    }
};

// --- Field Validators ---
const checkEmail = () => {
    let valid = false;
    const email = emailBB.value.trim();
    if (!isRequired(email)) {
        showError(emailBB, "Email cannot be empty");
    } else if (!isEmailValid(email)) {
        showError(emailBB, "Email is not in a valid format");
    } else {
        showSuccess(emailBB);
        valid = true;
    }
    return valid;
};

const checkPassword = () => {
    let valid = false;
    const password = passwordBB.value.trim();
    if (!isRequired(password)) {
        showError(passwordBB, "Password cannot be empty");
    } else {
        showSuccess(passwordBB);
        valid = true;
    }
    return valid;
};

// --- Form Submission ---
formLoginBB.addEventListener("submit", function (e) {
    e.preventDefault();

    let isEmailOk = checkEmail(),
        isPasswordOk = checkPassword();

    let isFormValid = isEmailOk && isPasswordOk;

    if (isFormValid) {
        const inputEmail = emailBB.value.trim();
        const inputPassword = passwordBB.value.trim();

        // 1. Retrieve registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

        // 2. Check if user exists with matching email and password
        const matchedUser = registeredUsers.find(
            (user) => user.email.toLowerCase() === inputEmail.toLowerCase() && user.password === inputPassword
        );

        if (matchedUser) {
            // 3. Set the current session
            localStorage.setItem("currentUser", JSON.stringify(matchedUser));

            showLoginAlert("Login successful! Redirecting...", true);

            // 4. Redirect after short pause
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            showLoginAlert("Invalid email or password. Please try again.");
            showError(passwordBB, "Incorrect credentials");
        }
    }
});

// --- Real-Time Input Validation ---
formLoginBB.addEventListener("input", function (e) {
    switch (e.target.id) {
        case "email":
            checkEmail();
            break;
        case "password":
            checkPassword();
            break;
    }
});