import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, firebaseSignOut } from "@/lib/firebase.js";
import { supabase } from "@/integrations/supabase/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        // Store user info
        const userInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };

        setUser(userInfo);
        localStorage.setItem("firebase_user", JSON.stringify(userInfo));

        // Get user role from Supabase
        try {
          const { data: userRole, error: roleError } = await supabase
            .from("auth_users")
            .select("role")
            .eq("uid", firebaseUser.uid)
            .single();

          if (roleError && roleError.code !== "PGRST116") {
            // PGRST116 = no rows found (first login)
            console.warn("Error fetching role:", roleError);
          }

          if (userRole?.role) {
            console.log("Existing user found with role:", userRole.role);
            setRole(userRole.role);
            localStorage.setItem("user_role", userRole.role);
          } else {
            // First login - use role from sessionStorage if available
            const selectedRole = sessionStorage.getItem("selected_role") || "patient";
            console.log("First login detected. Setting role:", selectedRole);
            setRole(selectedRole);
            localStorage.setItem("user_role", selectedRole);

            // Store this role in Supabase
            const { error: insertError } = await supabase
              .from("auth_users")
              .insert([
                {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName,
                  role: selectedRole,
                  photo_url: firebaseUser.photoURL,
                }
              ]);

            if (insertError) {
              console.warn("Could not store user role in Supabase:", insertError);
              // Don't block - user is still authenticated even if we couldn't save to Supabase
            }
          }
        } catch (err) {
          console.error("Auth context error:", err);
        }
      } else {
        // User signed out
        setUser(null);
        setRole(null);
        localStorage.removeItem("firebase_user");
        localStorage.removeItem("user_role");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      setUser(null);
      setRole(null);
      localStorage.removeItem("firebase_user");
      localStorage.removeItem("user_role");
      sessionStorage.removeItem("selected_role");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
