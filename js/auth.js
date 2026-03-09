var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AuthService {
    constructor() {
        this.baseUrl = "https://dummyjson.com/auth";
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Attempting to login...");
                const isConnected = yield this._testConnection();
                if (!isConnected) {
                    throw new Error("Cannot connect to server. Check your internet connection.");
                }
                const response = yield fetch(`${this.baseUrl}/login`, {
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
                    const errorData = yield response.json().catch(() => ({}));
                    throw new Error(errorData.message ||
                        `Login failed with status ${response.status}`);
                }
                const data = yield response.json();
                if (!data.accessToken || !data.refreshToken) {
                    throw new Error("Invalid response: missing tokens");
                }
                this.saveTokens(data);
                console.log("Login successful!");
                return {
                    success: true,
                    data: data,
                };
            }
            catch (error) {
                console.error("Login error:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Login failed",
                };
            }
        });
    }
    _testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://dummyjson.com/products/1", {
                    mode: "cors",
                });
                return response.ok;
            }
            catch (_a) {
                return false;
            }
        });
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
export const auth = new AuthService();
