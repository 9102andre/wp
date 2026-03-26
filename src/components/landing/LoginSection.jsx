import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, ClipboardList, FlaskConical, LogIn, Pill, Stethoscope, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/Button.jsx";
import { signInWithGoogle } from "@/lib/firebase.js";

const roles = [
  { id: "patient", label: "Patient", icon: User, color: "199 89% 38%" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, color: "168 60% 40%" },
  { id: "receptionist", label: "Receptionist", icon: ClipboardList, color: "260 60% 55%" },
  { id: "pharmacist", label: "Pharmacist", icon: Pill, color: "25 90% 55%" },
  { id: "lab", label: "Lab Technician", icon: FlaskConical, color: "330 70% 50%" },
];

export default function LoginSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [selectedRole, setSelectedRole] = useState("patient");
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem("wecare_role", selectedRole);
    sessionStorage.setItem("selected_role", selectedRole);
    // For patients, always start the multi-step registration/diagnosis entry flow.
    const target =
      selectedRole === "patient"
        ? "/login/patient?mode=register"
        : `/login/${selectedRole}`;
    // Use full navigation to avoid any unexpected SPA router interception.
    window.location.assign(target);
  };

  const handleGoogleLogin = () => {
    setOauthLoading(true);
    setOauthError(null);
    // Remember which role they selected before the redirect
    sessionStorage.setItem("selected_role", selectedRole);
    try {
      signInWithGoogle(); // This redirects the page — no await needed
    } catch (err) {
      setOauthError(err.message || "Google sign-in failed.");
      setOauthLoading(false);
    }
  };

  return (
    <section id="login" className="section loginSection" ref={ref}>
      <div className="loginBg" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="sectionHeader"
        >
          <span className="kicker">Access Portal</span>
          <h2 className="titleLg">
            Unified <span className="textGradient">Login</span>
          </h2>
          <p className="muted loginLead">
            Select your role and sign in to access your personalized dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="loginCard"
        >
          <div className="loginGrid">
            {/* Role selector */}
            <div className="loginRolePane">
              <p className="loginRoleLabel">Select Role</p>
              <div className="loginRoleGrid">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`roleBtn ${selectedRole === role.id ? "roleBtnSelected" : ""}`}
                  >
                    <div
                      className="roleIconBox"
                      style={{
                        background: `hsl(${role.color} / ${selectedRole === role.id ? 0.15 : 0.08})`,
                      }}
                    >
                      <role.icon width={16} height={16} style={{ color: `hsl(${role.color})` }} />
                    </div>
                    <span className="roleLabel">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA pane */}
            <div className="loginCtaPane">
              <div className="loginCtaHeader">
                <LogIn width={18} height={18} style={{ color: "hsl(var(--primary))" }} />
                <h3 className="loginCtaTitle">
                  Continue as {roles.find((r) => r.id === selectedRole)?.label}
                </h3>
              </div>

              <p className="muted loginCtaText">
                After choosing your role, you&apos;ll be taken to the next screen to complete a few simple steps.
              </p>

              {/* ── Google OAuth button ── */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={oauthLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  width: "100%",
                  padding: "0.65rem 1rem",
                  marginBottom: oauthError ? "0.4rem" : "0.75rem",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: oauthLoading ? "not-allowed" : "pointer",
                  opacity: oauthLoading ? 0.6 : 1,
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { if (!oauthLoading) e.currentTarget.style.background = "hsl(var(--accent))"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--card))"; }}
              >
                {oauthLoading ? (
                  <span className="spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                    <path d="M6.306 14.691l6.571 4.819C14.655 16.108 19 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.31 0-9.821-3.317-11.436-7.96l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                    <path d="M43.611 20.083H42V20H24v8h11.303a11.991 11.991 0 01-4.087 5.571l6.19 5.238C42.021 35.016 44 29.891 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                  </svg>
                )}
                {oauthLoading ? "Redirecting…" : "Sign in with Google"}
              </button>

              {/* OAuth error */}
              {oauthError && (
                <p style={{ fontSize: "0.78rem", color: "hsl(0 80% 60%)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                  ⚠️ {oauthError}
                </p>
              )}

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ flex: 1, height: 1, background: "hsl(var(--border))" }} />
                <span className="muted" style={{ fontSize: 12 }}>or</span>
                <span style={{ flex: 1, height: 1, background: "hsl(var(--border))" }} />
              </div>

              <Button className="loginPrimaryBtn" type="button" onClick={handleContinue}>
                Continue as {roles.find((r) => r.id === selectedRole)?.label}
                <ArrowRight width={16} height={16} />
              </Button>

              {selectedRole === "patient" && (
                <p className="loginRegister">
                  New patient?{" "}
                  <button
                    type="button"
                    className="loginRegisterLink"
                    onClick={() => window.location.assign("/login/patient?mode=register")}
                  >
                    Start registration
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
