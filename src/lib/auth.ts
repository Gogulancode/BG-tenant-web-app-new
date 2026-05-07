import { API_URL } from "./api";

export async function logout() {
  try {
    const refresh = localStorage.getItem("refresh_token");

    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });
  } catch (e) {
    console.warn("Logout API failed (ignored)", e);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}
