import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Pill, CalendarClock } from "lucide-react";
import { useToast } from "@/context/toast.jsx";
import { Button } from "@/ui/Button.jsx";
import { Progress } from "@/ui/Progress.jsx";
import { ArrowRight } from "lucide-react";
import { getPrescriptionsForPharmacy, markPrescriptionDispensed, getNotices } from "@/lib/hospitalApi.js";

const STEPS = [
  { label: "Queue",    description: "Prescription queue",     Icon: User },
  { label: "Details",  description: "Review & verify",        Icon: Pill },
  { label: "Dispense", description: "Confirm delivery",       Icon: CalendarClock },
];

export default function PharmacistPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, n] = await Promise.all([getPrescriptionsForPharmacy(), getNotices("pharmacist")]);
      setPrescriptions(p.data || []);
      setNotices(n.data || []);
      setLoading(false);
    })();
  }, []);

  const toggleMed = (name) => {
    setCheckedMeds(c => c.includes(name) ? c.filter(m => m !== name) : [...c, name]);
  };

  const handleDispense = async () => {
    if (!selected) {
      addToast("Please select a prescription first", "error", 2000);
      return;
    }
    setLoading(true);
    try {
      await markPrescriptionDispensed(selected.id);
      addToast("Medicines dispensed successfully", "success", 2000);
      setPrescriptions(ps => ps.map(p => p.id === selected.id ? { ...p, status: "Dispensed" } : p));
    } catch (err) {
      addToast("Error: " + err.message, "error", 4000);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const meds = selected?.medicines || [];

  return (
    <div className="stackMd">
      <div className="stepHeader">
        <div className="stepHeaderRow">
          <span style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>Step {step + 1} of {STEPS.length}</span>
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
            <div><p className="panelKicker">Pharmacy portal</p><h1 className="panelTitle">{STEPS[step].description}</h1></div>
          </div>
        </div>
      </div>



      {/* Step 0: Queue */}
      {step === 0 && (
        <div className="stackMd">
          {notices.length > 0 && (
            <div className="note">
              <p className="formLabel" style={{ marginBottom: 6 }}>Pharmacy Notices</p>
              <ul className="simpleList">{notices.map(n => <li key={n.id}>• {n.priority === "Urgent" ? "🔴 " : ""}{n.body}</li>)}</ul>
            </div>
          )}
          <div>
            <label className="formLabel">Select Prescription</label>
            <select className="formSelect" value={selected?.id || ""} onChange={e => {
              const p = prescriptions.find(p => p.id === e.target.value);
              setSelected(p || null);
              setCheckedMeds([]);
            }}>
              <option value="">Choose prescription</option>
              {prescriptions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.patients?.name || "Patient"} — {p.doctor_name} [{p.status}]
                </option>
              ))}
            </select>
          </div>
          {prescriptions.length === 0 && !loading && <p className="muted">No prescriptions in queue.</p>}
          {loading && <p className="muted"><span className="spinner" /> Loading…</p>}
        </div>
      )}

      {/* Step 1: Review */}
      {step === 1 && (
        <div className="stackMd">
          {!selected && <div className="note">Please go back and select a prescription first.</div>}
          {selected && (
            <>
              <div className="note noteStrong">
                <p className="formLabel">Diagnosis Context</p>
                <div className="dataRow" style={{ marginTop: 6 }}><span className="dataKey">Patient</span><span>{selected.patients?.name}</span></div>
                <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Doctor</span><span>{selected.doctor_name}</span></div>
                <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Diagnosis</span><span>{selected.diagnosis_text || "—"}</span></div>
                <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Status</span>
                  <span className={`badge ${selected.status === "Dispensed" ? "badgeDone" : "badgePending"}`}>{selected.status}</span>
                </div>
              </div>

              <div>
                <p className="formLabel" style={{ marginBottom: 8 }}>Medicines to verify & dispense</p>
                <ul className="checkList">
                  {meds.map((m, i) => (
                    <li key={i} className="checkItem">
                      <input type="checkbox" checked={checkedMeds.includes(m.name)} onChange={() => toggleMed(m.name)} id={`med-${i}`} />
                      <label htmlFor={`med-${i}`}>
                        <strong>{m.name}</strong> — {m.dose} for {m.duration}
                        {m.instructions && <span className="muted" style={{ fontSize: 12 }}> ({m.instructions})</span>}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="stackMd">
          <div className="note noteStrong">
            <p className="formLabel" style={{ marginBottom: 8 }}>Delivery Summary</p>
            <div className="dataRow"><span className="dataKey">Patient</span><span>{selected?.patients?.name || "—"}</span></div>
            <div className="dataRow" style={{ marginTop: 4 }}>
              <span className="dataKey">Verified</span>
              <span>{checkedMeds.length}/{meds.length} medicines</span>
            </div>
            <div className="dataRow" style={{ marginTop: 4 }}>
              <span className="dataKey">Pending</span>
              <span>{meds.filter(m => !checkedMeds.includes(m.name)).map(m => m.name).join(", ") || "None"}</span>
            </div>
          </div>
          {checkedMeds.length < meds.length && (
            <div className="note noteError">⚠️ Not all medicines have been verified. Go back to check remaining items.</div>
          )}
        </div>
      )}

      <div className="wizardFooter">
        <Button variant="outline" className="wizardBtn" onClick={() => { setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>Back</Button>
        <Button className="wizardBtn" onClick={() => {
          if (step === 2) { handleDispense(); return; }
          setStep(s => s + 1);
        }} disabled={loading}>
          {loading ? <><span className="spinner" /></> : step === 2 ? "Confirm Dispense" : <>Next <ArrowRight width={16} height={16} /></>}
        </Button>
      </div>
    </div>
  );
}
