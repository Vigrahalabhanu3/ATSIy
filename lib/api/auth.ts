export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me");
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const res = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAccount() {
  const res = await fetch("/api/auth/profile", {
    method: "DELETE",
  });
  return res.json();
}
