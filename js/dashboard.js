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
import { api } from "./api.js";
document.addEventListener("DOMContentLoaded", () => {
    if (!auth.isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    displayUserInfo();
    displayTokens();
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.logout();
        });
    }
    const getUserBtn = document.getElementById("getUserBtn");
    if (getUserBtn) {
        getUserBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield api.getCurrentUser();
            displayApiResult("User Data:", result);
            displayTokens();
        }));
    }
    const getProductsBtn = document.getElementById("getProductsBtn");
    if (getProductsBtn) {
        getProductsBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield api.getProducts();
            displayApiResult("Products List:", result);
            displayTokens();
        }));
    }
    const testExpiredBtn = document.getElementById("testExpiredBtn");
    if (testExpiredBtn) {
        testExpiredBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield api.getExpiredTokenDemo();
            displayApiResult("Expired Token Test:", result);
            displayTokens();
        }));
    }
    function displayUserInfo() {
        const user = auth.getCurrentUser();
        const userInfoDiv = document.getElementById("userInfo");
        if (user && userInfoDiv) {
            userInfoDiv.innerHTML = `
        <h3>User Information:</h3>
        <p><strong>ID:</strong> ${user.id || "N/A"}</p>
        <p><strong>Name:</strong> ${user.firstName || ""} ${user.lastName || ""}</p>
        <p><strong>Email:</strong> ${user.email || "N/A"}</p>
        <p><strong>Username:</strong> ${user.username || "N/A"}</p>
        <p><strong>Gender:</strong> ${user.gender || "N/A"}</p>
        ${user.image
                ? `<img src="${user.image}" alt="Profile" style="max-width: 100px; border-radius: 50%;">`
                : ""}
      `;
        }
    }
    function displayTokens() {
        const accessToken = auth.getAccessToken();
        const refreshToken = auth.getRefreshToken();
        const accessTokenEl = document.getElementById("accessToken");
        const refreshTokenEl = document.getElementById("refreshToken");
        if (accessTokenEl) {
            accessTokenEl.textContent = accessToken
                ? accessToken.substring(0, 50) + "..."
                : "No token";
        }
        if (refreshTokenEl) {
            refreshTokenEl.textContent = refreshToken
                ? refreshToken.substring(0, 50) + "..."
                : "No token";
        }
    }
    function displayApiResult(title, result) {
        const resultDiv = document.getElementById("apiResult");
        if (!resultDiv)
            return;
        const statusText = result.success ? "✅ Success" : "❌ Error";
        const statusColor = result.success ? "#4CAF50" : "#f44336";
        let resultContent = "";
        if (result.success && result.data) {
            resultContent = JSON.stringify(result.data, null, 2);
        }
        else {
            resultContent = JSON.stringify({
                success: result.success,
                error: result.error,
                needsRefresh: result.needsRefresh,
            }, null, 2);
        }
        resultDiv.innerHTML = `
      <div style="margin-bottom: 10px; padding: 10px; border-radius: 4px; color: white; background-color: ${statusColor};">
        <strong>${statusText}</strong>
      </div>
      <div><strong>${title}</strong></div>
      <pre style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; overflow-x: auto;">${resultContent}</pre>
    `;
    }
});
