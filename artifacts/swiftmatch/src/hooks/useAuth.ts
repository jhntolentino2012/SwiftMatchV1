import { useState, useEffect } from "react";
import { parseAuthResponse } from "@/lib/auth-response";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id: number;
  email: string;
  phone: string;
  applicantId: number | null;
  targetIndustry: string | null;
  targetRole: string | null;
  careerLevel: string | null;
}

function getToken() {
  return localStorage.getItem("sm_auth_token");
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          // Persist applicantId so Assessment page and quizzes can use it immediately
          if (data.applicantId != null) {
            localStorage.setItem("sm_applicant_id", String(data.applicantId));
          }
        }
        setUser(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("sm_auth_token");
    setUser(null);
  }

  return { user, loading, logout };
}

export async function apiPost(path: string, body: unknown) {
  const token = getToken();
  const endpoint = path.startsWith("/api/") ? path : `/api/auth${path}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return parseAuthResponse(res);
}
