import { useEffect } from "react";
import { refreshToken } from "@/lib/api";

const TEN_MINUTES = 10 * 60 * 1000;

export function useTokenAutoRefresh() {
  useEffect(() => {
    // don't start timer if not logged in
    if (!localStorage.getItem("refresh_token")) return;

    const intervalId = setInterval(() => {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return;

      // fire and forget; refreshToken already handles failures
      refreshToken();
    }, TEN_MINUTES);

    return () => clearInterval(intervalId);
  }, []);
}
