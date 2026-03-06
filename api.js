class ApiService {
  constructor() {
    this.baseUrl = "https://dummyjson.com";
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      console.log(`Making request to: ${url}`);

      let response = await this._fetchWithAuth(url, options);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.status === 401) {
        console.log("Token expired, attempting to refresh...");

        const newToken = await this._refreshToken();

        if (newToken) {
          response = await this._fetchWithAuth(url, options);
        } else {
          auth.logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", response.status, errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        } catch {
          throw new Error(
            `HTTP error ${response.status}: ${errorText.substring(0, 100)}`
          );
        }
      }

      const data = await response.json();

      console.log("Request successful:", data);

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("API Error details:", {
        message: error.message,
        endpoint: endpoint,
        options: options,
      });

      return {
        success: false,
        error: error.message || "Request failed",
      };
    }
  }

  async _fetchWithAuth(url, options = {}) {
    const token = auth.getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      method: options.method || "GET",
      mode: "cors",
      credentials: "omit",
    };

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error("Fetch error:", error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async _refreshToken() {
    try {
      if (this.isRefreshing) {
        console.log("Refresh already in progress, waiting...");
        return new Promise((resolve) => {
          this.refreshSubscribers.push(resolve);
        });
      }

      this.isRefreshing = true;
      console.log("Starting token refresh...");

      const refreshToken = auth.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
          expiresInMins: 30,
        }),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Refresh failed:", response.status, errorText);
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log("Token successfully refreshed!", data);

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid refresh response: missing tokens");
      }

      auth.saveTokens(data);

      this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
      this.refreshSubscribers = [];

      return data.accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);

      this.refreshSubscribers = [];

      if (error.message.includes("401") || error.message.includes("403")) {
        auth.logout();
      }

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  async getCurrentUser() {
    const result = await this.request("/auth/me");

    if (!result.success) {
      console.log("Trying alternative method for user data...");

      const user = auth.getCurrentUser();
      if (user) {
        return {
          success: true,
          data: user,
        };
      }
    }

    return result;
  }

  async getProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("Products fetch error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getExpiredTokenDemo() {
    const result = await this.request("/auth/me-expired");

    if (!result.success) {
      return {
        success: false,
        error: "Token expired (demo)",
        needsRefresh: true,
      };
    }

    return result;
  }
}

const api = new ApiService();

async function testConnection() {
  try {
    const response = await fetch("https://dummyjson.com/products/1", {
      mode: "cors",
    });
    const data = await response.json();
    console.log("Connection test successful:", data);
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
}

testConnection().then((isConnected) => {
  if (!isConnected) {
    console.warn(
      "Cannot connect to DummyJSON API. Check your internet connection."
    );
  }
});
