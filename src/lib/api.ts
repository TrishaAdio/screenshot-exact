// Thin client for the SymDeals VPS backend (see /backend in this repo).
// Override at build time: VITE_API_URL=https://api.symdeals.com
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "https://erroneous-resistantly-larita.ngrok-free.dev";

const TOKEN_KEY = "symdeals.token";
const TOKEN_EXPIRY_KEY = "symdeals.token_expiry";
const USER_KEY = "symdeals.user";
const ADMIN_TOKEN_KEY = "symdeals.admin.token";
const ADMIN_KEY = "symdeals.admin";

// Session lifetime: 2 days
export const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
  totalSaved?: number;
};

export type AuthSuccess = {
  success: true;
  token: string;
  user: AuthUser;
};

export type AuthError = { success: false; message: string };

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = "GET", body, token } = init;
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Connection issue. Please check your internet and try again.");
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || !data || (data as { success?: boolean }).success === false) {
    const raw = (data as { message?: string })?.message;
    throw new Error(sanitizeServerMessage(raw, res.status));
  }
  return data as T;
}

// Strip any infrastructure details (URLs, hostnames, stack traces) from
// server messages before they're surfaced to end users.
function sanitizeServerMessage(raw: string | undefined, status: number): string {
  const fallback =
    status >= 500
      ? "Server temporarily unavailable. Please try again shortly."
      : status === 401 || status === 403
        ? "Your session has expired. Please sign in again."
        : status === 404
          ? "We couldn't find what you were looking for."
          : status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : "Something went wrong. Please try again.";

  if (!raw || typeof raw !== "string") return fallback;
  // If the message contains a URL, hostname, stack, or looks like a debug
  // payload, drop it entirely — never leak infrastructure to the UI.
  if (
    /https?:\/\//i.test(raw) ||
    /\b(?:ngrok|localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i.test(raw) ||
    /\bat\s+\S+\s+\(/.test(raw) ||
    /[A-Za-z]+Error:/.test(raw) ||
    raw.length > 200
  ) {
    return fallback;
  }
  return raw;
}

function postJSON<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body });
}

export function signup(input: { name: string; email: string; password: string }) {
  return postJSON<AuthSuccess>("/api/auth/signup", input);
}

export function login(input: { email: string; password: string }) {
  return postJSON<AuthSuccess>("/api/auth/login", input);
}

export function fetchMe(): Promise<{ success: true; user: AuthUser }> {
  return request("/api/auth/me", { token: getToken() });
}

export function updateName(input: { name: string }) {
  return request<{ success: true; user: AuthUser }>("/api/user/update-name", {
    method: "PATCH",
    body: input,
    token: getToken(),
  });
}

export function updateEmail(input: { newEmail: string; currentPassword: string }) {
  return request<{ success: true; user: AuthUser }>("/api/user/update-email", {
    method: "PATCH",
    body: input,
    token: getToken(),
  });
}

export function updatePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return request<{ success: true }>("/api/user/update-password", {
    method: "PATCH",
    body: input,
    token: getToken(),
  });
}

export function sendOtp(): Promise<{
  success: true;
  alreadyVerified?: boolean;
  expiresInSec?: number;
}> {
  return request("/api/auth/send-otp", {
    method: "POST",
    body: {},
    token: getToken(),
  });
}

export function verifyOtp(input: {
  code: string;
}): Promise<{ success: true; user: AuthUser }> {
  return request("/api/auth/verify-otp", {
    method: "POST",
    body: input,
    token: getToken(),
  });
}

export function forgotPassword(input: {
  email: string;
}): Promise<{ success: true; message?: string }> {
  return postJSON("/api/auth/forgot-password", input);
}

export function verifyResetToken(token: string): Promise<{ success: true }> {
  return request(`/api/auth/reset-password/${encodeURIComponent(token)}`);
}

export function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<{ success: true }> {
  return postJSON("/api/auth/reset-password", input);
}

export function updateCachedUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function saveSession(result: AuthSuccess) {
  if (typeof window === "undefined") return;
  try {
    const expiry = Date.now() + SESSION_TTL_MS;
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  } catch {
    /* storage might be disabled */
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token) return null;
    if (expiryRaw) {
      const expiry = Number(expiryRaw);
      if (Number.isFinite(expiry) && Date.now() > expiry) {
        clearSession();
        return null;
      }
    }
    return token;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export const API_BASE = API_URL;

// Resolve an image path coming from the API. Backend stores relative paths
// like "/uploads/abc.webp" — we prefix the API origin so <img src> works.
// Absolute URLs (http/https/data/blob) are returned unchanged for back-compat.
export function resolveImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_URL}${path}`;
}

// ---------------- Admin ----------------

export type AdminUser = { id: string; email: string; createdAt?: string };
export type AdminLoginSuccess = {
  success: true;
  token: string;
  admin: AdminUser;
};

export function adminLogin(input: { email: string; password: string }) {
  return postJSON<AdminLoginSuccess>("/api/admin/login", input);
}

export function saveAdminSession(result: AdminLoginSuccess) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(result.admin));
  } catch {
    /* ignore */
  }
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

export type AdminTodayUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AdminEmailRecipient = { email: string; name: string };

export function fetchAdminAllUserEmails(): Promise<{
  success: true;
  total: number;
  users: AdminEmailRecipient[];
}> {
  return request("/api/admin/users/emails", { token: getAdminToken() });
}

export function adminSendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: true; to: string }> {
  return request("/api/admin/send-email", {
    method: "POST",
    body: input,
    token: getAdminToken(),
  });
}

export function fetchAdminTodayUsers(): Promise<{
  success: true;
  todayUsers: number;
  monthUsers: number;
  totalUsers: number;
  users: AdminTodayUser[];
}> {
  return request("/api/admin/stats/today", { token: getAdminToken() });
}

export type AdminWeeklyPoint = {
  day: string;
  dayFull?: string;
  label?: string;
  date: string;
  count: number;
};

export type AdminStatsRange = "7d" | "30d";

export function fetchAdminWeeklyStats(range: AdminStatsRange = "7d"): Promise<{
  success: true;
  range: AdminStatsRange;
  data: AdminWeeklyPoint[];
}> {
  return request(`/api/admin/stats/weekly?range=${range}`, {
    token: getAdminToken(),
  });
}

export type ProductPlan = { months: number; price: number };

export const PRODUCT_CATEGORIES = [
  "Subscriptions",
  "Combo Pack",
  "Software",
  "Music",
  "Adult",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: string;
  service_id?: number;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  plans: ProductPlan[];
  createdAt?: string;
};

export function fetchProducts(
  category?: ProductCategory
): Promise<{ success: true; products: Product[] }> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/api/products${qs}`);
}

export function fetchProduct(
  id: string
): Promise<{ success: true; product: Product }> {
  return request(`/api/products/${encodeURIComponent(id)}`);
}

export function adminCreateProduct(input: {
  name: string;
  service_id?: number;
  category: ProductCategory;
  description: string;
  image: string;
  plans: ProductPlan[];
}): Promise<{ success: true; product: Product }> {
  return request("/api/admin/products", {
    method: "POST",
    body: input,
    token: getAdminToken(),
  });
}

export function adminDeleteProduct(
  id: string
): Promise<{ success: true; id: string }> {
  return request(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}

// Upload an image (admin only). Returns an absolute URL safe to store in DB.
export async function adminUploadImage(
  file: File
): Promise<{ success: true; imageUrl: string; filename: string; size: number }> {
  const token = getAdminToken();
  if (!token) throw new Error("Admin session expired. Please sign in again.");

  const form = new FormData();
  form.append("image", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/admin/upload`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
  } catch {
    throw new Error(`Cannot reach backend at ${API_URL}.`);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || !data || (data as { success?: boolean }).success === false) {
    const msg =
      (data as { message?: string })?.message || `Upload failed (${res.status})`;
    throw new Error(msg);
  }
  return data as {
    success: true;
    imageUrl: string;
    filename: string;
    size: number;
  };
}


// ---------------- Orders ----------------

export type OrderStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type Order = {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  amount: number;
  status: OrderStatus;
  invoiceId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function createOrder(input: {
  service: string;
  promoCode?: string;
  value: number;
  productName: string;
  productImage?: string;
  invoiceId?: string;
}): Promise<{ success: true; order: Order }> {
  return request("/api/orders", {
    method: "POST",
    body: input,
    token: getToken(),
  });
}

export function fetchMyOrders(): Promise<{ success: true; orders: Order[] }> {
  return request("/api/orders", { token: getToken() });
}

export function verifyOrderStatus(
  orderId: string
): Promise<{ success: true; status: OrderStatus }> {
  return request(`/api/orders/verify/${encodeURIComponent(orderId)}?t=${Date.now()}`, {
    token: getToken(),
  });
}

// ---------------- Notices ----------------

export type NoticeType = "info" | "success" | "warning" | "urgent";

export type Notice = {
  id: string;
  title: string;
  message: string;
  type: NoticeType;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function fetchActiveNotices(): Promise<{
  success: true;
  notices: Notice[];
}> {
  return request(`/api/notices?t=${Date.now()}`);
}

export function adminFetchNotices(): Promise<{
  success: true;
  notices: Notice[];
}> {
  return request("/api/admin/notices", { token: getAdminToken() });
}

export function adminCreateNotice(input: {
  title?: string;
  message: string;
  type: NoticeType;
  active?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}): Promise<{ success: true; notice: Notice }> {
  return request("/api/admin/notices", {
    method: "POST",
    body: input,
    token: getAdminToken(),
  });
}

export function adminUpdateNotice(
  id: string,
  input: Partial<{
    title: string;
    message: string;
    type: NoticeType;
    active: boolean;
    startsAt: string | null;
    expiresAt: string | null;
  }>
): Promise<{ success: true; notice: Notice }> {
  return request(`/api/admin/notices/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
    token: getAdminToken(),
  });
}

export function adminDeleteNotice(
  id: string
): Promise<{ success: true; id: string }> {
  return request(`/api/admin/notices/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}
