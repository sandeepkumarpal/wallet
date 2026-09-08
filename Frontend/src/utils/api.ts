import axios from "axios";
import { API_URLS } from "./Apiurls";

const TOKEN_KEY = "wallet_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: API_URLS.BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
