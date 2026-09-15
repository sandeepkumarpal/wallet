// Same-origin path so phones on LAN hit Next.js (:5173), which proxies to the backend.
const BASE_URL = "/api/v1";

export const API_URLS = {
  BASE_URL,
  LOGIN_USER: "/user/login-user",
  REGISTER_USER: "/user/register-user",
  GOOGLE_AUTH: "/user/google-auth",
  ME: "/user/me",
  CHANGE_PASSWORD: "/user/change-password",
  TRANSACTIONS: "/transactions",
  NEW_TRANSACTION: "/transactions/new-transaction",
  SUMMARY: "/transactions/summary",
  BUDGET: "/transactions/budget",
  CATEGORY_BUDGETS: "/transactions/category-budgets",
  RECURRING: "/transactions/recurring",
  RECURRING_RUN: "/transactions/recurring/run",
};

export default API_URLS;
