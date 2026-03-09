var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { auth } from "./auth.js";
if (window.location.pathname.includes("index.html") ||
    window.location.pathname === "/") {
    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("loginForm");
        const errorDiv = document.getElementById("errorMessage");
        const successDiv = document.getElementById("successMessage");
        const loginBtn = document.getElementById("loginBtn");
        if (auth.isAuthenticated()) {
            window.location.href = "dashboard.html";
            return;
        }
        if (!loginForm || !errorDiv || !successDiv || !loginBtn) {
            console.error("Required form elements not found");
            return;
        }
        loginForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            errorDiv.style.display = "none";
            successDiv.style.display = "none";
            const username = document.getElementById("username");
            const password = document.getElementById("password");
            if (!username || !password) {
                showError("Form inputs not found");
                return;
            }
            if (!username.value.trim() || !password.value.trim()) {
                showError("Please fill in all fields");
                return;
            }
            loginBtn.disabled = true;
            loginBtn.textContent = "Signing in...";
            const result = yield auth.login(username.value, password.value);
            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";
            if (result.success) {
                showSuccess("Login successful! Redirecting...");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            }
            else {
                showError(result.error || "Login failed");
            }
        }));
        function showError(message) {
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = "block";
            }
        }
        function showSuccess(message) {
            if (successDiv) {
                successDiv.textContent = message;
                successDiv.style.display = "block";
            }
        }
    });
}
