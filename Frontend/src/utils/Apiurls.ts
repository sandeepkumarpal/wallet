const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const API_URLS = {
  BASE_URL,
  LOGIN_USER: `${BASE_URL}/user/login-user`,
  REGISTER_USER: `${BASE_URL}/user/register-user`,
  ME: `${BASE_URL}/user/me`,
  CHANGE_PASSWORD: `${BASE_URL}/user/change-password`,
  TRANSACTIONS: `${BASE_URL}/transactions`,
  NEW_TRANSACTION: `${BASE_URL}/transactions/new-transaction`,
  SUMMARY: `${BASE_URL}/transactions/summary`,
  BUDGET: `${BASE_URL}/transactions/budget`,
  CATEGORY_BUDGETS: `${BASE_URL}/transactions/category-budgets`,
  RECURRING: `${BASE_URL}/transactions/recurring`,
  RECURRING_RUN: `${BASE_URL}/transactions/recurring/run`,
};

export default API_URLS;
