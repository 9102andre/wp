import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, FileText, User, AlertTriangle } from "lucide-react";
import { Textarea } from "@/ui/Textarea.jsx";
import { Button } from "@/ui/Button.jsx";
import { Progress } from "@/ui/Progress.jsx";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/context/toast.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import {
  getTodaysAppointments,
  getNotices,
  getEmergencyAlerts,
  getEncountersByPatient,
  createPrescription,
  getLabResultsByRole,
} from "@/lib/hospitalApi.js";

const STEPS = [
  { label: "Notices", description: "Notices & schedule", Icon: CalendarClock },
  { label: "Patients", description: "Review patients & AI diagnosis", Icon: User },
  { label: "Prescribe", description: "Write prescription", Icon: FileText },
];

export default function DoctorPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [notices, setNotices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dose: "", duration: "", instructions: "" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [n, a, appt] = await Promise.all([
          getNotices("doctor"),
          getEmergencyAlerts(),
          getTodaysAppointments(),
        ]);
        setNotices(n.data || []);
        setAlerts(a.data || []);
        setAppointments(appt.data || []);
      } catch (err) {
        addToast("Failed to load doctor dashboard: " + err.message, "error", 4000);
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  const selectPatient = async (appt) => {
    setSelectedAppt(appt);
    if (appt.patient_id) {
      try {
        const [enc, lab] = await Promise.all([
          getEncountersByPatient(appt.patient_id),
          getLabResultsByRole("doctor", user?.uid),
        ]);
        setEncounters(enc.data || []);
        setLabResults(lab.data || []);
      } catch (err) {
        addToast("Failed to load patient data: " + err.message, "error", 3000);
      }
    }
  };

  const addMedicineRow = () => setMedicines(m => [...m, { name: "", dose: "", duration: "", instructions: "" }]);
  const updMedicine = (i, key, val) => setMedicines(m => m.map((r, j) => j === i ? { ...r, [key]: val } : r));

  const handlePrescribe = async () => {
    if (!selectedAppt) {
      addToast("Please select a patient first", "error", 2000);
      return;
    }
    setLoading(true);
    try {
      await createPrescription(
        selectedAppt.patient_id,
        selectedAppt.encounter_id,
        selectedAppt.doctor_name,
        diagnosis,
        medicines.filter(m => m.name.trim())
      );
      addToast("Prescription saved successfully", "success", 2000);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      addToast("Failed to save prescription: " + err.message, "error", 4000);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="stackMd">
      <div className="stepHeader">
        <div className="stepHeaderRow">
          <span style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Screen {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step].description}</span>
        </div>
        <div className="stepper" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
          {STEPS.map((s, i) => (
            <div key={s.label} className="stepItem">
              <div className={`stepIcon ${i === step ? "stepIconActive" : i < step ? "stepIconDone" : ""}`}><s.Icon width={13} height={13} /></div>
              <span className={`stepLabel ${i === step ? "stepLabelActive" : ""}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} style={{ marginTop: "0.5rem" }} />
      </div>

      <div className="panelCard">
        <div className="panelHeader">
          <div className="panelTitleRow">
            <div className="panelIconBox"><RoleIcon width={20} height={20} style={{ color: accentColor }} /></div>
            <div><p className="panelKicker">Doctor portal</p><h1 className="panelTitle">{STEPS[step].description}</h1></div>
          </div>
        </div>
      </div>

      {/* Step 0: Notices & schedule */}
      {step === 0 && (
        <div className="stackMd">
          {/* Emergency alerts */}
          {alerts.length > 0 && (
            <div className="note noteError">
              <p className="formLabel" style={{ marginBottom: 8 }}>🚨 Emergency Alerts ({alerts.length})</p>
              <ul className="simpleList">
                {alerts.map(a => <li key={a.id}>• <strong>{a.patient_name}</strong> ({a.department}) — {a.description}</li>)}
              </ul>
            </div>
          )}

          {/* Notices */}
          <div className="note">
            <p className="formLabel" style={{ marginBottom: 8 }}>Important Notices</p>
            {loading ? <p><span className="spinner" /> Loading…</p> : (
              <ul className="simpleList">
                {notices.length === 0 && <li>No new notices.</li>}
                {notices.map(n => <li key={n.id}>• {n.priority === "High" || n.priority === "Urgent" ? "⚠️ " : ""}{n.body}</li>)}
              </ul>
            )}
          </div>

          {/* Today's appointments */}
          <div className="note noteStrong">
            <p className="formLabel" style={{ marginBottom: 8 }}>Today's Appointments ({appointments.length})</p>
            {appointments.length === 0 && <p className="muted">No appointments scheduled today.</p>}
            <ul className="simpleList">
              {appointments.map(a => (
                <li key={a.id}>
                  {a.appt_time} — <strong>{a.patients?.name || "Patient"}</strong> ({a.department}) — {a.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Review patients */}
      {step === 1 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Select a patient to review</label>
            <select className="formSelect" value={selectedAppt?.id || ""} onChange={e => {
              const appt = appointments.find(a => a.id === e.target.value);
              if (appt) selectPatient(appt);
            }}>
              <option value="">Choose patient</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>{a.patients?.name || "Patient"} — {a.department} ({a.appt_time})</option>
              ))}
            </select>
          </div>

          {selectedAppt && (
            <>
              <div className="note noteStrong">
                <p className="formLabel">Patient Details</p>
                <div className="dataRow" style={{ marginTop: 6 }}><span className="dataKey">Name</span><span>{selectedAppt.patients?.name}</span></div>
                <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Age / Gender</span><span>{selectedAppt.patients?.age} / {selectedAppt.patients?.gender}</span></div>
                <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Department</span><span>{selectedAppt.department}</span></div>
              </div>

              {encounters.length > 0 && (
                <div className="note">
                  <p className="formLabel" style={{ marginBottom: 8 }}>AI Diagnosis Summary</p>
                  {encounters.map(enc => (
                    <div key={enc.id} style={{ marginBottom: 10 }}>
                      <div className="stepHeaderRow" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                          {enc.department}
                        </span>
                        <span className={`pill ${enc.ai_severity === "High" ? "pillHigh" : enc.ai_severity === "Moderate" ? "pillModerate" : "pillMild"}`}>
                          {enc.ai_severity}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Symptoms:</strong> {enc.symptoms}</p>
                      <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Duration:</strong> {enc.duration}</p>
                      <p style={{ fontSize: 13 }}><strong>AI:</strong> {enc.ai_recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {labResults.length > 0 && (
                <div className="note">
                  <p className="formLabel" style={{ marginBottom: 8 }}>Lab Reports</p>
                  {labResults.map(r => (
                    <div key={r.id} style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 13 }}><strong>Tests:</strong> {r.lab_orders?.tests?.join(", ")}</p>
                      <pre className="monoBlock" style={{ marginTop: 4 }}>{JSON.stringify(r.results, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 2: Prescribe */}
      {step === 2 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Clinical Diagnosis</label>
            <Textarea placeholder="Write your clinical findings and diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="formLabel">Medicines</label>
            {medicines.map((m, i) => (
              <div key={i} className="formGrid2" style={{ marginBottom: 8 }}>
                <input className="formSelect" placeholder="Medicine name" value={m.name} onChange={e => updMedicine(i, "name", e.target.value)} />
                <input className="formSelect" placeholder="Dose (e.g. 1-0-1)" value={m.dose} onChange={e => updMedicine(i, "dose", e.target.value)} />
                <input className="formSelect" placeholder="Duration (e.g. 5 days)" value={m.duration} onChange={e => updMedicine(i, "duration", e.target.value)} />
                <input className="formSelect" placeholder="Instructions" value={m.instructions} onChange={e => updMedicine(i, "instructions", e.target.value)} />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addMedicineRow} style={{ borderRadius: "0.75rem" }}>+ Add medicine</Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="wizardFooter">
        <Button variant="outline" className="wizardBtn" onClick={() => { setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>Back</Button>
        <Button className="wizardBtn" onClick={() => {
          if (step === 2) { handlePrescribe(); return; }
          setStep(s => Math.min(STEPS.length - 1, s + 1));
        }} disabled={loading}>
          {loading ? <><span className="spinner" /> Processing…</> : step === 2 ? "Save Prescription" : <>Next <ArrowRight width={16} height={16} /></>}
        </Button>
      </div>
    </div>
  );
}
