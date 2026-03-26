import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { User, Stethoscope, ClipboardList, Pill, FlaskConical, LogIn, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();

  const handleContinue = () => {
    const target = selectedRole === "patient" ? "/login/patient?mode=register" : `/login/${selectedRole}`;
    // Use full navigation to avoid any unexpected SPA router interception.
    window.location.assign(target);
  };

  return (
    <section id="login" className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-[image:var(--hero-gradient)] opacity-[0.04]" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Access Portal</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Unified <span className="text-gradient">Login</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select your role and sign in to access your personalized dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-[280px_1fr]">
            {/* Role selector */}
            <div className="bg-muted/50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Select Role</p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left ${
                      selectedRole === role.id
                        ? "bg-card shadow-lg border border-border scale-[1.02]"
                        : "hover:bg-card/60"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `hsl(${role.color} / ${selectedRole === role.id ? 0.15 : 0.08})` }}
                    >
                      <role.icon
                        className="w-4 h-4"
                        style={{ color: `hsl(${role.color})` }}
                      />
                    </div>
                    <span className="hidden md:inline">{role.label}</span>
                    <span className="md:hidden text-xs">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA to role-specific login pages */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <LogIn className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-['Inter']">
                  Continue as {roles.find((r) => r.id === selectedRole)?.label}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                After choosing your role, you&apos;ll be taken to the next screen
                to complete a few simple steps.
              </p>

              <Button className="w-full rounded-xl h-11 font-semibold group" type="button" onClick={handleContinue}>
                Continue as {roles.find((r) => r.id === selectedRole)?.label}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>

              {selectedRole === "patient" && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  New patient?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
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
