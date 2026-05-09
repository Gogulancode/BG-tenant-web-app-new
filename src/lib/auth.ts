import { API_URL } from "./api";
import { clearAuthSession, getAccessToken } from "./auth-session";

export async function logout() {
  try {
    const accessToken = getAccessToken();

    if (accessToken) {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (e) {
    console.warn("Logout API failed (ignored)", e);
  }

  clearAuthSession();

  window.location.href = "/login";
}
