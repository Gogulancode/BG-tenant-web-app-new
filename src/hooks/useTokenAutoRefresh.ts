import { useEffect } from "react";
import { refreshToken } from "@/lib/api";
import { getRefreshToken } from "@/lib/auth-session";

const TEN_MINUTES = 10 * 60 * 1000;

export function useTokenAutoRefresh() {
  useEffect(() => {
    // don't start timer if not logged in
    if (!getRefreshToken()) return;

    const intervalId = setInterval(() => {
      const refresh = getRefreshToken();
      if (!refresh) return;

      // fire and forget; refreshToken already handles failures
      refreshToken();
    }, TEN_MINUTES);

    return () => clearInterval(intervalId);
  }, []);
}
