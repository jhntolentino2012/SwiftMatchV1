import { useCallback, useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
type Access = {
  userId?: number;
  canViewReports: boolean;
  canViewCandidatePool: boolean;
  loading: boolean;
  error: string | null;
};
const denied = { canViewReports: false, canViewCandidatePool: false };

export function useReportAccess(userId?: number) {
  const [revision, setRevision] = useState(0);
  const [access, setAccess] = useState<Access>({ ...denied, loading: true, error: null });
  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    if (!userId) {
      setAccess({ ...denied, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    let requestVersion = 0;
    const check = async () => {
      const version = ++requestVersion;
      const token = localStorage.getItem("sm_auth_token");
      try {
        const response = await fetch(`${BASE}/api/auth/report-access`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          if (!controller.signal.aborted && version === requestVersion)
            setAccess({ ...denied, userId, loading: false, error: null });
          return;
        }
        if (!response.ok) throw new Error("Unable to verify report access. Please try again.");
        const data = await response.json();
        if (typeof data.canViewReports !== "boolean" || typeof data.canViewCandidatePool !== "boolean")
          throw new Error("Invalid report access response. Please try again.");
        if (!controller.signal.aborted && version === requestVersion)
          setAccess({ ...data, userId, loading: false, error: null });
      } catch (error) {
        if (!controller.signal.aborted && version === requestVersion)
          setAccess({ ...denied, userId, loading: false, error: error instanceof Error ? error.message : "Unable to verify report access." });
      }
    };
    void check();
    const interval = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    window.addEventListener("storage", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", check);
    };
  }, [userId, revision]);

  if (access.userId !== userId) return { ...denied, loading: !!userId, error: null, refresh };
  return { ...access, refresh };
}