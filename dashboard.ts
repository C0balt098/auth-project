import {auth, LoginResponse} from "./auth.js";
import {api, ApiResponse, ProductsResponse} from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  
  if (!auth.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  
  displayUserInfo();
  displayTokens();

  
  const logoutBtn = document.getElementById(
    "logoutBtn"
  ) as HTMLButtonElement | null;
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();
    });
  }

  const getUserBtn = document.getElementById(
    "getUserBtn"
  ) as HTMLButtonElement | null;
  if (getUserBtn) {
    getUserBtn.addEventListener("click", async () => {
      const result: ApiResponse<LoginResponse> = await api.getCurrentUser();
      displayApiResult("User Data:", result);
      displayTokens();
    });
  }

  const getProductsBtn = document.getElementById(
    "getProductsBtn"
  ) as HTMLButtonElement | null;
  if (getProductsBtn) {
    getProductsBtn.addEventListener("click", async () => {
      const result: ApiResponse<ProductsResponse> = await api.getProducts();
      displayApiResult("Products List:", result);
      displayTokens();
    });
  }

  const testExpiredBtn = document.getElementById(
    "testExpiredBtn"
  ) as HTMLButtonElement | null;
  if (testExpiredBtn) {
    testExpiredBtn.addEventListener("click", async () => {
      const result: ApiResponse = await api.getExpiredTokenDemo();
      displayApiResult("Expired Token Test:", result);
      displayTokens();
    });
  }

  
  function displayUserInfo(): void {
    const user: LoginResponse | null = auth.getCurrentUser();
    const userInfoDiv = document.getElementById(
      "userInfo"
    ) as HTMLElement | null;

    if (user && userInfoDiv) {
      userInfoDiv.innerHTML = `
        <h3>User Information:</h3>
        <p><strong>ID:</strong> ${user.id || "N/A"}</p>
        <p><strong>Name:</strong> ${user.firstName || ""} ${
        user.lastName || ""
      }</p>
        <p><strong>Email:</strong> ${user.email || "N/A"}</p>
        <p><strong>Username:</strong> ${user.username || "N/A"}</p>
        <p><strong>Gender:</strong> ${user.gender || "N/A"}</p>
        ${
          user.image
            ? `<img src="${user.image}" alt="Profile" style="max-width: 100px; border-radius: 50%;">`
            : ""
        }
      `;
    }
  }

  function displayTokens(): void {
    const accessToken: string | null = auth.getAccessToken();
    const refreshToken: string | null = auth.getRefreshToken();

    const accessTokenEl = document.getElementById(
      "accessToken"
    ) as HTMLElement | null;
    const refreshTokenEl = document.getElementById(
      "refreshToken"
    ) as HTMLElement | null;

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

  function displayApiResult(title: string, result: ApiResponse): void {
    const resultDiv = document.getElementById(
      "apiResult"
    ) as HTMLElement | null;
    if (!resultDiv) return;

    const statusText: string = result.success ? "✅ Success" : "❌ Error";
    const statusColor: string = result.success ? "#4CAF50" : "#f44336";

    let resultContent: string = "";

    if (result.success && result.data) {
      resultContent = JSON.stringify(result.data, null, 2);
    } else {
      resultContent = JSON.stringify(
        {
          success: result.success,
          error: result.error,
          needsRefresh: result.needsRefresh,
        },
        null,
        2
      );
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
