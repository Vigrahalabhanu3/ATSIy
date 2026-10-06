import {
  apiFetch,
  setStoredToken,
  setStoredUser,
  removeStoredToken,
  removeStoredUser,
} from "./client";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) {
    const token = json.data?.token || json.token;
    const user = json.data?.user || json.user;
    if (token) setStoredToken(token);
    if (user) setStoredUser({ ...user, isLoggedIn: true });
  }
  return json;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (json.success) {
    const token = json.data?.token || json.token;
    const user = json.data?.user || json.user;
    if (token) setStoredToken(token);
    if (user) setStoredUser({ ...user, isLoggedIn: true });
  }
  return json;
}

export async function logoutUser() {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (e) {
    console.error("Logout request error:", e);
  } finally {
    removeStoredToken();
    removeStoredUser();
  }
  return { success: true };
}

export async function getCurrentUser() {
  const res = await apiFetch("/api/auth/me");
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const res = await apiFetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAccount() {
  const res = await apiFetch("/api/auth/profile", {
    method: "DELETE",
  });
  removeStoredToken();
  removeStoredUser();
  return res.json();
}
