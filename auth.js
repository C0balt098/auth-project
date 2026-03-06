class AuthService {
  constructor() {
    this.baseUrl = "https://dummyjson.com/auth";
  }

  async login(username, password) {
    try {
      console.log("Attempting to login...");

    
      const isConnected = await this._testConnection();
      if (!isConnected) {
        throw new Error(
          "Cannot connect to server. Check your internet connection."
        );
      }

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          expiresInMins: 30,
        }),
        mode: "cors",
        credentials: "omit",
      });

  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed with status ${response.status}`
        );
      }

      const data = await response.json();

      
      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid response: missing tokens");
      }

      this.saveTokens(data);

      console.log("Login successful!");

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async _testConnection() {
    try {
      const response = await fetch("https://dummyjson.com/products/1", {
        mode: "cors",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  saveTokens(data) {
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));
      console.log("Tokens saved successfully");
    }
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  logout() {
    console.log("Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }
}


const auth = new AuthService();


if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/"
) {
  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.getElementById("errorMessage");
    const successDiv = document.getElementById("successMessage");
    const loginBtn = document.getElementById("loginBtn");

    if (auth.isAuthenticated()) {
      window.location.href = "dashboard.html";
      return;
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      errorDiv.style.display = "none";
      successDiv.style.display = "none";

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (!username || !password) {
        showError("Please fill in all fields");
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = "Signing in...";

      const result = await auth.login(username, password);

      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";

      if (result.success) {
        showSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showError(result.error);
      }
    });

    function showError(message) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }

    function showSuccess(message) {
      successDiv.textContent = message;
      successDiv.style.display = "block";
    }
  });
}
