export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  error?: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export class AuthService {
  private readonly baseUrl: string = "https://dummyjson.com/auth";

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      console.log("Attempting to login...");

      const isConnected: boolean = await this._testConnection();
      if (!isConnected) {
        throw new Error(
          "Cannot connect to server. Check your internet connection."
        );
      }

      const response: Response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          expiresInMins: 30,
        } as LoginCredentials),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as any).message ||
            `Login failed with status ${response.status}`
        );
      }

      const data: LoginResponse = await response.json();

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid response: missing tokens");
      }

      this.saveTokens(data);

      console.log("Login successful!");

      return {
        success: true,
        data: data,
      };
    } catch (error: unknown) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  private async _testConnection(): Promise<boolean> {
    try {
      const response: Response = await fetch(
        "https://dummyjson.com/products/1",
        {
          mode: "cors",
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  saveTokens(data: LoginResponse): void {
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));
      console.log("Tokens saved successfully");
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  getCurrentUser(): LoginResponse | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    console.log("Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }
}

export const auth: AuthService = new AuthService();
