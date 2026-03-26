import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, firebaseSignOut } from "@/lib/firebase.js";

const AuthContext = createContext(null);

/**
 * Role access rules:
 * - patient:      can only access /login/patient
 * - doctor:       can access ALL portals
 * - receptionist: can access receptionist, lab, pharmacist
 * - lab:          can access receptionist, lab, pharmacist
 * - pharmacist:   can access receptionist, lab, pharmacist
 */
const ROLE_ACCESS = {
    patient: ["patient"],
    doctor: ["patient", "doctor", "receptionist", "pharmacist", "lab"],
    receptionist: ["receptionist", "lab", "pharmacist"],
    lab: ["receptionist", "lab", "pharmacist"],
    pharmacist: ["receptionist", "lab", "pharmacist"],
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // Firebase user object
    const [role, setRole] = useState(null);        // "patient" | "doctor" | ...
    const [loading, setLoading] = useState(true);  // true while checking auth

    // Listen for Firebase auth state changes
    useEffect(() => {
        if (!firebaseAuth) {
            setLoading(false);
            return;
        }
        const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photo: firebaseUser.photoURL,
                });
                // Prefer the latest role selected before auth redirect, then fallback.
                const savedRole =
                    sessionStorage.getItem("selected_role") ||
                    localStorage.getItem("wecare_role") ||
                    "patient";
                localStorage.setItem("wecare_role", savedRole);
                sessionStorage.removeItem("selected_role");
                setRole(savedRole);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const setUserRole = (newRole) => {
        setRole(newRole);
        localStorage.setItem("wecare_role", newRole);
    };

    const logout = async () => {
        await firebaseSignOut();
        setUser(null);
        setRole(null);
        localStorage.removeItem("wecare_role");
        sessionStorage.removeItem("firebase_user");
        sessionStorage.removeItem("selected_role");
    };

    /**
     * Check if the current user's role can access a given portal.
     */
    const canAccess = (portalRole) => {
        if (!role) return false;
        const allowed = ROLE_ACCESS[role] || [];
        return allowed.includes(portalRole);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, setUserRole, logout, canAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
