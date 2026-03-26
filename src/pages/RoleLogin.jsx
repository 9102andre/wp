import { useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Stethoscope,
  ClipboardList,
  Pill,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import PatientPortal from "@/components/portals/PatientPortal.jsx";
import DoctorPortal from "@/components/portals/DoctorPortal.jsx";
import ReceptionPortal from "@/components/portals/ReceptionPortal.jsx";
import PharmacistPortal from "@/components/portals/PharmacistPortal.jsx";
import LabPortal from "@/components/portals/LabPortal.jsx";

const roleConfig = {
  patient:      { label: "Patient",        accentColor: "hsl(199 89% 52%)",  icon: User },
  doctor:       { label: "Doctor",         accentColor: "hsl(168 60% 48%)",  icon: Stethoscope },
  receptionist: { label: "Reception",      accentColor: "hsl(260 60% 55%)",  icon: ClipboardList },
  pharmacist:   { label: "Pharmacist",     accentColor: "hsl(25 90% 55%)",   icon: Pill },
  lab:          { label: "Lab Technician", accentColor: "hsl(330 70% 50%)",  icon: FlaskConical },
};

export default function RoleLogin() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { user, role, loading, setUserRole } = useAuth();

  const roleKey = useMemo(() => {
    const keys = Object.keys(roleConfig);
    if (!roleId) return "patient";
    return keys.includes(roleId) ? roleId : "patient";
  }, [roleId]);

  const role_config = roleConfig[roleKey];

  // Keep auth role in sync with the route role so selected portal always opens.
  useEffect(() => {
    if (!loading && user) {
      if (role && role !== roleKey) {
        setUserRole(roleKey);
      }
    }
  }, [user, role, roleKey, loading, setUserRole]);

  // Ensure the portal is visible immediately after navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [roleKey]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "1rem",
      }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
        <p>Loading…</p>
      </div>
    );
  }

  const goBackToLanding = () => navigate("/#login");

  const renderContent = () => {
    const props = { accentColor: role_config.accentColor, roleIcon: role_config.icon };

    switch (roleKey) {
      case "patient":      return <PatientPortal {...props} />;
      case "doctor":       return <DoctorPortal {...props} />;
      case "receptionist": return <ReceptionPortal {...props} />;
      case "pharmacist":   return <PharmacistPortal {...props} />;
      case "lab":          return <LabPortal {...props} />;
      default:             return <PatientPortal {...props} />;
    }
  };

  return (
    <div className="portalPage">
      <div className="portalContainer">
        <button type="button" onClick={goBackToLanding} className="backLink">
          <ArrowLeft width={14} height={14} />
          Back to role selection
        </button>
        {renderContent()}
      </div>
    </div>
  );
}
