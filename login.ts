import {auth, LoginResult} from "./auth.js";

if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/"
) {
  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById(
      "loginForm"
    ) as HTMLFormElement | null;
    const errorDiv = document.getElementById(
      "errorMessage"
    ) as HTMLElement | null;
    const successDiv = document.getElementById(
      "successMessage"
    ) as HTMLElement | null;
    const loginBtn = document.getElementById(
      "loginBtn"
    ) as HTMLButtonElement | null;

    
    if (auth.isAuthenticated()) {
      window.location.href = "dashboard.html";
      return;
    }

    
    if (!loginForm || !errorDiv || !successDiv || !loginBtn) {
      console.error("Required form elements not found");
      return;
    }

    loginForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

      
      errorDiv.style.display = "none";
      successDiv.style.display = "none";

     
      const username = document.getElementById(
        "username"
      ) as HTMLInputElement | null;
      const password = document.getElementById(
        "password"
      ) as HTMLInputElement | null;

     
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

      
      const result: LoginResult = await auth.login(
        username.value,
        password.value
      );

      
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";

      
      if (result.success) {
        showSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showError(result.error || "Login failed");
      }
    });

    
    function showError(message: string): void {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
      }
    }

    function showSuccess(message: string): void {
      if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = "block";
      }
    }
  });
}
