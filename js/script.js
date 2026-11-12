/* =========================================
   STACKLY FINANCE 2
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================
       PAGE LOADER
    ===================================== */

    const loader = document.querySelector(".page-loader");

    if (loader) {
        window.addEventListener("load", function () {
            setTimeout(function () {
                loader.classList.add("hide");
            }, 500);
        });

        setTimeout(function () {
            loader.classList.add("hide");
        }, 2500);
    }


    /* =====================================
       SCROLL REVEAL ANIMATION
    ===================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(function (element) {
            element.classList.add("show");
        });
    }


    /* =====================================
       MOBILE DASHBOARD SIDEBAR
    ===================================== */

    const menuButton = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });

        sidebar.querySelectorAll(".sidebar-link").forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 800 && link.getAttribute("href") !== "#") {
                    sidebar.classList.remove("open");
                }
            });
        });
    }


    /* =====================================
       LOCAL STORAGE HELPERS
    ===================================== */

    function getFinanceUser() {
        return JSON.parse(localStorage.getItem("financeUser") || "null");
    }

    function saveFinanceUser(user) {
        localStorage.setItem("financeUser", JSON.stringify(user));
    }

    function showMessage(elementId, text, success = false) {
        const message = document.getElementById(elementId);

        if (message) {
            message.textContent = text;
            message.classList.toggle("success", success);
        }
    }


    /* =====================================
       SIGNUP FORM
    ===================================== */

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("signupName").value.trim();
            const email = document.getElementById("signupEmail").value.trim().toLowerCase();
            const phone = document.getElementById("signupPhone").value.trim();
            const terms = document.getElementById("acceptTerms").checked;

            if (name.length < 2) {
                showMessage("signupMessage", "Please enter your full name.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("signupMessage", "Please enter a valid email address.");
                return;
            }

            if (!/^[0-9+\-\s()]{7,18}$/.test(phone)) {
                showMessage("signupMessage", "Please enter a valid phone number.");
                return;
            }

            if (!terms) {
                showMessage("signupMessage", "Please accept the Terms and Conditions.");
                return;
            }

            const existingUser = getFinanceUser();

            if (existingUser && existingUser.email === email) {
                showMessage("signupMessage", "This email already has an account. Please sign in.");
                return;
            }

            const pendingUser = {
                name: name,
                email: email,
                phone: phone
            };

            localStorage.setItem("financePendingUser", JSON.stringify(pendingUser));

            window.location.href = "email-verification.html";
        });
    }


    /* =====================================
       EMAIL VERIFICATION / DEMO OTP
    ===================================== */

    const otpInputs = document.querySelectorAll(".otp-input");

    otpInputs.forEach(function (input, index) {

        input.addEventListener("input", function () {
            input.value = input.value.replace(/\D/g, "").slice(0, 1);

            if (input.value && otpInputs[index + 1]) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Backspace" && !input.value && otpInputs[index - 1]) {
                otpInputs[index - 1].focus();
            }
        });

    });

    const verificationForm = document.getElementById("verificationForm");

    if (verificationForm) {
        verificationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const pendingUser = JSON.parse(
                localStorage.getItem("financePendingUser") || "null"
            );

            if (!pendingUser) {
                showMessage("verificationMessage", "Your sign-up details are missing. Please sign up again.");
                return;
            }

            let enteredOTP = "";

            otpInputs.forEach(function (input) {
                enteredOTP += input.value;
            });

            if (enteredOTP.length !== 6) {
                showMessage("verificationMessage", "Please enter all six digits.");
                return;
            }

            if (enteredOTP !== "123456") {
                showMessage("verificationMessage", "Incorrect demo code. Please enter 123456.");
                return;
            }

            localStorage.setItem("financeEmailVerified", "true");

            window.location.href = "create-password.html";
        });
    }


    /* =====================================
       CREATE PASSWORD FORM
    ===================================== */

    const createPasswordForm = document.getElementById("createPasswordForm");

    if (createPasswordForm) {
        createPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const pendingUser = JSON.parse(
                localStorage.getItem("financePendingUser") || "null"
            );

            const verified = localStorage.getItem("financeEmailVerified");

            if (!pendingUser || verified !== "true") {
                showMessage("passwordMessage", "Please complete email verification first.");
                return;
            }

            const password = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            const strongPassword =
                password.length >= 8 &&
                /[A-Za-z]/.test(password) &&
                /\d/.test(password);

            if (!strongPassword) {
                showMessage(
                    "passwordMessage",
                    "Password must contain at least 8 characters, one letter and one number."
                );
                return;
            }

            if (password !== confirmPassword) {
                showMessage("passwordMessage", "Passwords do not match.");
                return;
            }

            const financeUser = {
                name: pendingUser.name,
                email: pendingUser.email,
                phone: pendingUser.phone,
                password: password,
                country: ""
            };

            saveFinanceUser(financeUser);

            localStorage.removeItem("financePendingUser");
            localStorage.removeItem("financeEmailVerified");

            window.location.href = "account-created.html";
        });
    }


    /* =====================================
       LOGIN FORM
    ===================================== */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            const financeUser = getFinanceUser();

            if (!financeUser) {
                showMessage("loginMessage", "No account found. Please create an account first.");
                return;
            }

            if (email !== financeUser.email || password !== financeUser.password) {
                showMessage("loginMessage", "Incorrect email or password. Please try again.");
                return;
            }

            localStorage.setItem("financeLoggedIn", "true");

            window.location.href = "dashboard.html";
        });
    }


    /* =====================================
       FORGOT PASSWORD FORM
    ===================================== */

    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
            const financeUser = getFinanceUser();

            if (!financeUser || email !== financeUser.email) {
                showMessage("forgotMessage", "No account found with this email address.");
                return;
            }

            showMessage(
                "forgotMessage",
                "Demo account found. Real password reset requires backend email integration.",
                true
            );
        });
    }


    /* =====================================
       DASHBOARD USER INFORMATION
    ===================================== */

    const dashboardPage = document.querySelector(".dashboard-body");
    const profilePage = document.getElementById("profileForm");

    if (dashboardPage || profilePage) {

        if (localStorage.getItem("financeLoggedIn") !== "true") {
            window.location.href = "login.html";
            return;
        }

        const financeUser = getFinanceUser();

        if (!financeUser) {
            localStorage.removeItem("financeLoggedIn");
            window.location.href = "login.html";
            return;
        }

        const firstLetter = financeUser.name.charAt(0).toUpperCase();

        const dashboardName = document.getElementById("dashboardUserName");
        const dashboardAvatar = document.getElementById("dashboardAvatar");
        const welcomeName = document.getElementById("welcomeName");

        if (dashboardName) {
            dashboardName.textContent = financeUser.name;
        }

        if (dashboardAvatar) {
            dashboardAvatar.textContent = firstLetter;
        }

        if (welcomeName) {
            welcomeName.textContent = "Welcome back, " + financeUser.name.split(" ")[0] + "!";
        }

        const profileHeaderName = document.getElementById("profileHeaderName");
        const profileHeaderAvatar = document.getElementById("profileHeaderAvatar");
        const profileDisplayName = document.getElementById("profileDisplayName");
        const profileDisplayEmail = document.getElementById("profileDisplayEmail");
        const profileAvatar = document.getElementById("profileAvatar");

        if (profileHeaderName) {
            profileHeaderName.textContent = financeUser.name;
        }

        if (profileHeaderAvatar) {
            profileHeaderAvatar.textContent = firstLetter;
        }

        if (profileDisplayName) {
            profileDisplayName.textContent = financeUser.name;
        }

        if (profileDisplayEmail) {
            profileDisplayEmail.textContent = financeUser.email;
        }

        if (profileAvatar) {
            profileAvatar.textContent = firstLetter;
        }
    }


    /* =====================================
       PROFILE FORM
    ===================================== */

    const profileForm = document.getElementById("profileForm");

    if (profileForm) {
        const financeUser = getFinanceUser();

        document.getElementById("profileName").value = financeUser.name || "";
        document.getElementById("profileEmail").value = financeUser.email || "";
        document.getElementById("profilePhone").value = financeUser.phone || "";
        document.getElementById("profileCountry").value = financeUser.country || "";

        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const updatedName = document.getElementById("profileName").value.trim();
            const updatedPhone = document.getElementById("profilePhone").value.trim();
            const updatedCountry = document.getElementById("profileCountry").value.trim();

            if (updatedName.length < 2) {
                showMessage("profileMessage", "Please enter a valid name.");
                return;
            }

            if (updatedPhone && !/^[0-9+\-\s()]{7,18}$/.test(updatedPhone)) {
                showMessage("profileMessage", "Please enter a valid phone number.");
                return;
            }

            financeUser.name = updatedName;
            financeUser.phone = updatedPhone;
            financeUser.country = updatedCountry;

            saveFinanceUser(financeUser);

            showMessage("profileMessage", "Your profile has been updated successfully.", true);

            const displayName = document.getElementById("profileDisplayName");
            const headerName = document.getElementById("profileHeaderName");
            const avatar = document.getElementById("profileAvatar");
            const headerAvatar = document.getElementById("profileHeaderAvatar");

            if (displayName) displayName.textContent = updatedName;
            if (headerName) headerName.textContent = updatedName;
            if (avatar) avatar.textContent = updatedName.charAt(0).toUpperCase();
            if (headerAvatar) headerAvatar.textContent = updatedName.charAt(0).toUpperCase();
        });
    }


    /* =====================================
       LOGOUT
    ===================================== */

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("financeLoggedIn");
        });
    }

});

// Show and hide password functionality

document.addEventListener("click", function (event) {
    const toggleButton = event.target.closest(".password-toggle");

    if (!toggleButton) return;

    const wrapper = toggleButton.closest(".password-wrapper");
    const passwordInput = wrapper.querySelector("input");

    const isPasswordHidden = passwordInput.type === "password";

    passwordInput.type = isPasswordHidden ? "text" : "password";

    toggleButton.setAttribute(
        "aria-label",
        isPasswordHidden ? "Hide password" : "Show password"
    );

    toggleButton.setAttribute(
        "aria-pressed",
        isPasswordHidden ? "true" : "false"
    );

    toggleButton.innerHTML = isPasswordHidden
        ? `<svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3l18 18"/>
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9"/>
            <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/>
        </svg>`
        : `<svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`;
});