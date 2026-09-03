const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  data?: any;
  _retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Queue mechanism for handling simultaneous 401s
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshUrl = `${API_BASE_URL}/auth/refresh`;
    const response = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, _retry, ...customOptions } = options;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    headers: requestHeaders,
    credentials: "include", // Essential for HttpOnly cookie authentication sessions
    ...customOptions,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    // If it's 204 No Content, return empty or parsed empty object
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 401 Unauthorized for Silent Token Refresh (except on auth entrypoints)
    const isAuthEndpoint =
      cleanEndpoint.includes("/auth/login") ||
      cleanEndpoint.includes("/auth/register") ||
      cleanEndpoint.includes("/auth/refresh") ||
      cleanEndpoint.includes("/auth/logout") ||
      cleanEndpoint.includes("/auth/forgot-password") ||
      cleanEndpoint.includes("/auth/reset-password") ||
      cleanEndpoint.includes("/auth/2fa/login-challenge");

    if (response.status === 401 && !_retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Wait for the current refresh operation to complete
        const refreshSuccess = await new Promise<boolean>((resolve) => {
          subscribeTokenRefresh(resolve);
        });

        if (refreshSuccess) {
          return request<T>(endpoint, { ...options, _retry: true });
        }
      } else {
        isRefreshing = true;
        const refreshSuccess = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(refreshSuccess);

        if (refreshSuccess) {
          // Retry the original request with refreshed cookie session
          return request<T>(endpoint, { ...options, _retry: true });
        }
      }
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const errorMessage = result?.message || response.statusText || "Something went wrong";
      throw new ApiError(errorMessage, response.status, result?.errors);
    }

    return result as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError((error as Error).message || "Network error", 500);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "data">) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, "method" | "data">) =>
    request<T>(endpoint, { ...options, method: "POST", data }),

  put: <T>(endpoint: string, data?: any, options?: Omit<RequestOptions, "method" | "data">) =>
    request<T>(endpoint, { ...options, method: "PUT", data }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "data">) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
