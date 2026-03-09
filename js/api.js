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
export class ApiService {
    constructor() {
        this.baseUrl = "https://dummyjson.com";
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }
    request(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            try {
                console.log(`Making request to: ${url}`);
                let response = yield this._fetchWithAuth(url, options);
                if (!response) {
                    throw new Error("No response from server");
                }
                if (response.status === 401) {
                    console.log("Token expired, attempting to refresh...");
                    const newToken = yield this._refreshToken();
                    if (newToken) {
                        response = yield this._fetchWithAuth(url, options);
                    }
                    else {
                        auth.logout();
                        throw new Error("Session expired. Please login again.");
                    }
                }
                if (!response.ok) {
                    const errorText = yield response.text();
                    console.error("Response error:", response.status, errorText);
                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.message || `HTTP error ${response.status}`);
                    }
                    catch (_a) {
                        throw new Error(`HTTP error ${response.status}: ${errorText.substring(0, 100)}`);
                    }
                }
                const data = yield response.json();
                console.log("Request successful:", data);
                return {
                    success: true,
                    data: data,
                };
            }
            catch (error) {
                console.error("API Error details:", {
                    message: error instanceof Error ? error.message : "Unknown error",
                    endpoint: endpoint,
                    options: options,
                });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Request failed",
                };
            }
        });
    }
    _fetchWithAuth(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            const token = auth.getAccessToken();
            const headers = Object.assign({ "Content-Type": "application/json", Accept: "application/json" }, options.headers);
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const config = Object.assign(Object.assign({}, options), { headers, method: options.method || "GET", mode: "cors", credentials: "omit" });
            try {
                const response = yield fetch(url, config);
                return response;
            }
            catch (error) {
                console.error("Fetch error:", error);
                throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        });
    }
    _refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield fetch(`${this.baseUrl}/auth/refresh`, {
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
                    const errorText = yield response.text();
                    console.error("Refresh failed:", response.status, errorText);
                    throw new Error(`Refresh failed with status ${response.status}`);
                }
                const data = yield response.json();
                console.log("Token successfully refreshed!", data);
                if (!data.accessToken || !data.refreshToken) {
                    throw new Error("Invalid refresh response: missing tokens");
                }
                auth.saveTokens(data);
                this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
                this.refreshSubscribers = [];
                return data.accessToken;
            }
            catch (error) {
                console.error("Token refresh error:", error);
                this.refreshSubscribers = [];
                if (error instanceof Error &&
                    (error.message.includes("401") || error.message.includes("403"))) {
                    auth.logout();
                }
                return null;
            }
            finally {
                this.isRefreshing = false;
            }
        });
    }
    getCurrentUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.request("/auth/me");
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
        });
    }
    getProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/products`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    mode: "cors",
                });
                const data = yield response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch products");
                }
                return {
                    success: true,
                    data: data,
                };
            }
            catch (error) {
                console.error("Products fetch error:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to fetch products",
                };
            }
        });
    }
    getExpiredTokenDemo() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.request("/auth/me-expired");
            if (!result.success) {
                return {
                    success: false,
                    error: "Token expired (demo)",
                    needsRefresh: true,
                };
            }
            return result;
        });
    }
}
export const api = new ApiService();
export function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://dummyjson.com/products/1", {
                mode: "cors",
            });
            const data = yield response.json();
            console.log("Connection test successful:", data);
            return true;
        }
        catch (error) {
            console.error("Connection test failed:", error);
            return false;
        }
    });
}
testConnection().then((isConnected) => {
    if (!isConnected) {
        console.warn("Cannot connect to DummyJSON API. Check your internet connection.");
    }
});
