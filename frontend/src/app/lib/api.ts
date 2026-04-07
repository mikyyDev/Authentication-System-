const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "fluentian_auth_token";

export type UserResponse = {
  id: number;
  name: string;
  email: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
};

type MessageResponse = {
  message: string;
  code?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${API_URL}. Start FastAPI using: python -m uvicorn backend.main:app --reload`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Request failed");
  }

  return data as T;
}

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return request<UserResponse>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: payload.email,
        password: payload.password,
      }).toString(),
    });
  },
  refresh(payload: { refresh_token: string }) {
    return request<LoginResponse>("/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  sendCode(payload: { email: string }) {
    return request<MessageResponse>("/send-code", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verify(payload: { email: string; code: string }) {
    return request<MessageResponse>("/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me(token: string) {
    return request<UserResponse>("/me", { method: "GET" }, token);
  },
  deleteAccount(token: string) {
    return request<MessageResponse>("/delete-account", { method: "DELETE" }, token);
  },
};
