import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

/**
 * AuthCallback – Handles Firebase redirect after Google login.
 * The auth context will detect the signin and set up the user,
 * then we redirect to the appropriate portal.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      // User is authenticated with a role, redirect to role portal
      navigate(`/login/${role}`, { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "1rem",
    }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
      <p style={{ color: "hsl(var(--muted-foreground))" }}>Signing you in…</p>
    </div>
  );
}
