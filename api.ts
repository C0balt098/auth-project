import {auth, LoginResponse} from "./auth.js";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  needsRefresh?: boolean;
}

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export type RefreshSubscriber = (token: string) => void;

export class ApiService {
  private readonly baseUrl: string = "https://dummyjson.com";
  private isRefreshing: boolean = false;
  private refreshSubscribers: RefreshSubscriber[] = [];

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url: string = `${this.baseUrl}${endpoint}`;

    try {
      console.log(`Making request to: ${url}`);
      let response: Response | undefined = await this._fetchWithAuth(
        url,
        options
      );

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.status === 401) {
        console.log("Token expired, attempting to refresh...");

        const newToken: string | null = await this._refreshToken();

        if (newToken) {
          response = await this._fetchWithAuth(url, options);
        } else {
          auth.logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        const errorText: string = await response.text();
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

      const data: T = await response.json();

      console.log("Request successful:", data);

      return {
        success: true,
        data: data,
      };
    } catch (error: unknown) {
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
  }

  private async _fetchWithAuth(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const token: string | null = auth.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      method: options.method || "GET",
      mode: "cors",
      credentials: "omit",
    };

    try {
      const response: Response = await fetch(url, config);
      return response;
    } catch (error: unknown) {
      console.error("Fetch error:", error);
      throw new Error(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async _refreshToken(): Promise<string | null> {
    try {
      if (this.isRefreshing) {
        console.log("Refresh already in progress, waiting...");
        return new Promise((resolve) => {
          this.refreshSubscribers.push(resolve);
        });
      }

      this.isRefreshing = true;
      console.log("Starting token refresh...");

      const refreshToken: string | null = auth.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response: Response = await fetch(`${this.baseUrl}/auth/refresh`, {
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
        const errorText: string = await response.text();
        console.error("Refresh failed:", response.status, errorText);
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      console.log("Token successfully refreshed!", data);

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid refresh response: missing tokens");
      }

      auth.saveTokens(data);

      this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
      this.refreshSubscribers = [];

      return data.accessToken;
    } catch (error: unknown) {
      console.error("Token refresh error:", error);

      this.refreshSubscribers = [];

      if (
        error instanceof Error &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        auth.logout();
      }

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<LoginResponse>> {
    const result: ApiResponse<LoginResponse> =
      await this.request<LoginResponse>("/auth/me");

    if (!result.success) {
      console.log("Trying alternative method for user data...");

      const user: LoginResponse | null = auth.getCurrentUser();
      if (user) {
        return {
          success: true,
          data: user,
        };
      }
    }

    return result;
  }

  async getProducts(): Promise<ApiResponse<ProductsResponse>> {
    try {
      const response: Response = await fetch(`${this.baseUrl}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      const data: ProductsResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).message || "Failed to fetch products");
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: unknown) {
      console.error("Products fetch error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      };
    }
  }

  async getExpiredTokenDemo(): Promise<ApiResponse> {
    const result: ApiResponse = await this.request("/auth/me-expired");

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

export const api: ApiService = new ApiService();

export async function testConnection(): Promise<boolean> {
  try {
    const response: Response = await fetch("https://dummyjson.com/products/1", {
      mode: "cors",
    });
    const data: Product = await response.json();
    console.log("Connection test successful:", data);
    return true;
  } catch (error: unknown) {
    console.error("Connection test failed:", error);
    return false;
  }
}


testConnection().then((isConnected: boolean) => {
  if (!isConnected) {
    console.warn(
      "Cannot connect to DummyJSON API. Check your internet connection."
    );
  }
});
