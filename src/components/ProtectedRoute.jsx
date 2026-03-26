import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

/**
 * Wraps a portal route. If user is not logged in → redirect to home.
 * If user's role can't access this portal → redirect to their own portal.
 */
export default function ProtectedRoute({ children }) {
  const { user, role, loading, canAccess } = useAuth();
  const { roleId } = useParams();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "hsl(220 25% 14%)" }}>
        <div style={{ textAlign: "center", color: "hsl(210 25% 80%)" }}>
          <span className="spinner" style={{ marginRight: 8 }} />
          Checking authentication...
        </div>
      </div>
    );
  }

  // Not logged in → send to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but can't access this portal → go to their own portal
  if (roleId && !canAccess(roleId)) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  return children;
}
