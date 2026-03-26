import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Phone, X, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/Button.jsx";
import { useAccessibility } from "@/context/accessibility.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Departments", href: "#departments" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { zoom, increaseZoom, decreaseZoom, resetZoom } = useAccessibility();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/", { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate(`/login/${role}`, { replace: true });
  };

  return (
    <>
      {/* Top bar */}
      <div className="topBar">
        <div className="container topBarInner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="iconText">
              <Phone width={12} height={12} /> Emergency: 108
            </span>
            <span>Mon–Sat: 8AM – 9PM</span>
          </div>
          <span>support@wecare.com</span>
        </div>
      </div>

      <motion.nav
        className={`nav ${scrolled ? "navScrolled" : ""}`}
      >
        <div className="container navInner">
          {/* Logo */}
          <a href="/" className="brand">
            <div className="brandMark">
              <Heart width={20} height={20} color="white" />
            </div>
            <div className="leading-tight">
              <span className="brandTextTop">Wecare</span>
              <span className="brandTextBottom">Hospitals & Research</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="navLinks">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="navLink"
              >
                {l.label}
              </button>
            ))}

            {/* Accessibility: zoom controls */}
            <div className="zoomPill">
              <button
                type="button"
                onClick={decreaseZoom}
                className="zoomBtn"
                aria-label="Zoom out text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="zoomBtn"
                aria-label="Reset zoom"
              >
                100%
              </button>
              <button
                type="button"
                onClick={increaseZoom}
                className="zoomBtn"
                aria-label="Zoom in text"
              >
                A+
              </button>
              <span className="zoomPct">{Math.round(zoom * 100)}%</span>
            </div>

            {/* User profile or login button */}
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                    />
                  ) : (
                    <UserIcon width={16} height={16} />
                  )}
                  <span>{user.name}</span>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "0.5rem",
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        zIndex: 50,
                        minWidth: "200px",
                      }}
                    >
                      <div style={{ padding: "0.5rem" }}>
                        <div style={{ padding: "0.5rem", borderBottom: "1px solid hsl(var(--border))" }}>
                          <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>Signed in as</p>
                          <p style={{ fontWeight: "600", fontSize: "0.875rem" }}>{user.email}</p>
                          <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                            Role: <span style={{ textTransform: "capitalize", fontWeight: "500" }}>{role}</span>
                          </p>
                        </div>

                        <button
                          onClick={handleGoToDashboard}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginTop: "0.5rem",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "hsl(var(--foreground))",
                          }}
                        >
                          Go to Dashboard
                        </button>

                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginTop: "0.5rem",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "hsl(0 84% 60%)",
                          }}
                        >
                          <LogOut width={16} height={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button onClick={() => scrollTo("#login")} size="sm" className="navCta">
                Login Portal
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X width={24} height={24} /> : <Menu width={24} height={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mobileMenu"
            >
              <div className="mobileMenuInner container">
                {navLinks.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.href)}
                    className="navLink"
                    style={{ textAlign: "left" }}
                  >
                    {l.label}
                  </button>
                ))}

                {user ? (
                  <>
                    <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "1rem", paddingTop: "1rem" }}>
                      <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <strong>{user.name}</strong>
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem" }}>
                        {user.email}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.75rem" }}>
                        Role: <span style={{ textTransform: "capitalize", fontWeight: "500" }}>{role}</span>
                      </p>
                      <Button onClick={handleGoToDashboard} className="navCtaMobile">
                        Go to Dashboard
                      </Button>
                      <Button
                        onClick={handleLogout}
                        style={{
                          marginTop: "0.5rem",
                          background: "hsl(0 84% 60%)",
                          color: "white",
                        }}
                        className="navCtaMobile"
                      >
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button onClick={() => scrollTo("#login")} className="navCtaMobile">
                    Login Portal
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

