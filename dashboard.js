document.addEventListener("DOMContentLoaded", () => {
  if (!auth.isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }

  displayUserInfo();
  displayTokens();

  document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.logout();
  });

  document.getElementById("getUserBtn").addEventListener("click", async () => {
    const result = await api.getCurrentUser();
    displayApiResult("User Data:", result);
    displayTokens();
  });

  document
    .getElementById("getProductsBtn")
    .addEventListener("click", async () => {
      const result = await api.getProducts();
      displayApiResult("Products List:", result);
      displayTokens();
    });

  document
    .getElementById("testExpiredBtn")
    .addEventListener("click", async () => {
      const result = await api.getExpiredTokenDemo();
      displayApiResult("Expired Token Test:", result);
      displayTokens();
    });

  function displayUserInfo() {
    const user = auth.getCurrentUser();
    const userInfoDiv = document.getElementById("userInfo");

    if (user) {
      userInfoDiv.innerHTML = `
                <h3>User Information:</h3>
                <p><strong>ID:</strong> ${user.id || "N/A"}</p>
                <p><strong>Name:</strong> ${user.firstName || ""} ${
        user.lastName || ""
      }</p>
                <p><strong>Email:</strong> ${user.email || "N/A"}</p>
                <p><strong>Username:</strong> ${user.username || "N/A"}</p>
            `;
    }
  }

  function displayTokens() {
    const accessToken = auth.getAccessToken();
    const refreshToken = auth.getRefreshToken();

    document.getElementById("accessToken").textContent = accessToken
      ? accessToken.substring(0, 50) + "..."
      : "No token";
    document.getElementById("refreshToken").textContent = refreshToken
      ? refreshToken.substring(0, 50) + "..."
      : "No token";
  }

  function displayApiResult(title, result) {
    const resultDiv = document.getElementById("apiResult");

    const statusText = result.success ? "Success" : "Error";

    let resultContent = "";

    if (result.success && result.data) {
      resultContent = JSON.stringify(result.data, null, 2);
    } else {
      resultContent = JSON.stringify(result, null, 2);
    }

    resultDiv.innerHTML = `
            <div style="margin-bottom: 10px; color: ${
              result.success ? "#9ae6b4" : "#fc8181"
            }">
                ${statusText}
            </div>
            <div><strong>${title}</strong></div>
            <pre style="margin-top: 10px; overflow-x: auto;">${resultContent}</pre>
        `;
  }
});
