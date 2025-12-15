"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminAuthContextValue = {
  authenticated: boolean;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
};

function useProvideAdminAuth(): {
  status: "checking" | "authenticated" | "unauthenticated";
  error: string | null;
  pending: boolean;
  tokenInput: string;
  setTokenInput: (value: string) => void;
  login: () => Promise<void>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
} {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        setStatus("authenticated");
        setError(null);
        return true;
      }
    } catch (err) {
      console.error("Failed to refresh admin session", err);
    }
    
    // Fallback: check localStorage for local development
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      const token = localStorage.getItem("coursespeak:adminToken");
      if (token) {
        setStatus("authenticated");
        setError(null);
        return true;
      }
    }
    
    setStatus("unauthenticated");
    return false;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async () => {
    const token = tokenInput.trim();
    if (!token) {
      setError("Token is required");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Invalid token");
        setStatus("unauthenticated");
        return;
      }
      // Fallback: store token in localStorage for local development
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        localStorage.setItem("coursespeak:adminToken", token);
      }
      setTokenInput("");
      setStatus("authenticated");
      setError(null);
    } catch (err) {
      console.error("Login failed", err);
      setError("Failed to log in. Please try again.");
      setStatus("unauthenticated");
    } finally {
      setPending(false);
    }
  }, [tokenInput]);

  const logout = useCallback(async () => {
    setPending(true);
    try {
      await fetch("/api/admin/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to log out", err);
    } finally {
      setPending(false);
      setStatus("unauthenticated");
    }
  }, []);

  return { status, error, pending, tokenInput, setTokenInput, login, refresh, logout };
}

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const { status, error, pending, tokenInput, setTokenInput, login, refresh, logout } =
    useProvideAdminAuth();

  const contextValue = useMemo<AdminAuthContextValue | null>(() => {
    if (status !== "authenticated") return null;
    return {
      authenticated: true,
      refresh,
      logout,
    };
  }, [status, refresh, logout]);

  if (status === "checking") {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <h2>Loading Admin</h2>
        <p className="muted">Memeriksa sesi admin...</p>
      </div>
    );
  }

  if (status !== "authenticated" || !contextValue) {
    return (
      <div className="container" style={{ padding: "2rem 0", maxWidth: 480 }}>
        <h2>Admin Login</h2>
        <p className="muted">Masukkan token admin untuk melanjutkan.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
          style={{ display: "grid", gap: 12 }}
        >
          <input
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="Admin token"
            className="pill"
            type="password"
            style={{ padding: 12 }}
            autoFocus
          />
          {error && <div style={{ color: "#f87171" }}>{error}</div>}
          <button className="pill" type="submit" disabled={pending}>
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={contextValue}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth harus dipanggil di dalam AdminAuthGate");
  }
  return ctx;
}

export function LogoutButton() {
  const { logout } = useAdminAuth();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="pill"
      onClick={async () => {
        setPending(true);
        await logout();
        setPending(false);
      }}
      disabled={pending}
    >
      {pending ? "Keluar..." : "Logout"}
    </button>
  );
}
