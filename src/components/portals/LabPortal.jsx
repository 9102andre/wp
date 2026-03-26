import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, FileText, CalendarClock, User } from "lucide-react";
import { useToast } from "@/context/toast.jsx";
import { Input } from "@/ui/Input.jsx";
import { Textarea } from "@/ui/Textarea.jsx";
import { Button } from "@/ui/Button.jsx";
import { Progress } from "@/ui/Progress.jsx";
import { ArrowRight } from "lucide-react";
import { getLabOrders, updateLabOrderStatus, saveLabResult, getNotices } from "@/lib/hospitalApi.js";

const STEPS = [
  { label: "Orders",  description: "Pending test requests",  Icon: FlaskConical },
  { label: "Process", description: "Enter test results",     Icon: FileText },
  { label: "Upload",  description: "Save & submit reports",  Icon: CalendarClock },
];

const TEST_FIELDS = {
  "CBC":            [{ name: "Hemoglobin",   unit: "g/dL",    ref: "12.0 - 17.5" },
                     { name: "WBC Count",    unit: "/μL",     ref: "4000 - 11000" },
                     { name: "Platelet Count",unit: "/μL",    ref: "150000 - 400000" },
                     { name: "RBC Count",    unit: "M/μL",    ref: "4.5 - 5.5" }],
  "Urine Analysis": [{ name: "pH",           unit: "",        ref: "4.5 - 8.0" },
                     { name: "Specific Gravity",unit: "",     ref: "1.005 - 1.030" },
                     { name: "Protein",      unit: "mg/dL",   ref: "Negative" },
                     { name: "Glucose",      unit: "mg/dL",   ref: "Negative" }],
  "Blood Glucose":  [{ name: "Fasting",      unit: "mg/dL",   ref: "70 - 100" },
                     { name: "Post-prandial", unit: "mg/dL",  ref: "< 140" }],
  "ECG":            [{ name: "Heart Rate",   unit: "bpm",     ref: "60 - 100" },
                     { name: "PR Interval",  unit: "ms",      ref: "120 - 200" },
                     { name: "QRS Duration", unit: "ms",      ref: "80 - 100" },
                     { name: "Findings",     unit: "",        ref: "Normal" }],
  "Lipid Profile":  [{ name: "Total Cholesterol",unit: "mg/dL",ref: "< 200" },
                     { name: "HDL",          unit: "mg/dL",   ref: "> 40" },
                     { name: "LDL",          unit: "mg/dL",   ref: "< 100" },
                     { name: "Triglycerides",unit: "mg/dL",   ref: "< 150" }],
  "LFT":            [{ name: "SGPT/ALT",    unit: "U/L",     ref: "7 - 56" },
                     { name: "SGOT/AST",     unit: "U/L",     ref: "10 - 40" },
                     { name: "Bilirubin",    unit: "mg/dL",   ref: "0.1 - 1.2" },
                     { name: "Alkaline Phosphatase", unit:"U/L",ref: "44 - 147" }],
  "Thyroid Profile":[{ name: "TSH",          unit: "mIU/L",   ref: "0.4 - 4.0" },
                     { name: "T3",           unit: "ng/dL",   ref: "80 - 200" },
                     { name: "T4",           unit: "μg/dL",   ref: "5.1 - 14.1" }],
  "X-Ray":          [{ name: "Region",       unit: "",        ref: "" },
                     { name: "Findings",     unit: "",        ref: "Normal" }],
  "CT Scan":        [{ name: "Region",       unit: "",        ref: "" },
                     { name: "Findings",     unit: "",        ref: "Normal" }],
};

export default function LabPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [resultValues, setResultValues] = useState({});
  const [techNotes, setTechNotes] = useState("");
  const [techName, setTechName] = useState("");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, n] = await Promise.all([getLabOrders(), getNotices("lab")]);
      setOrders(o.data || []);
      setNotices(n.data || []);
      setLoading(false);
    })();
  }, []);

  const selectOrder = (order) => {
    setSelected(order);
    setResultValues({});
    // Mark as in progress
    if (order.status === "Pending") {
      updateLabOrderStatus(order.id, "In Progress");
      setOrders(os => os.map(o => o.id === order.id ? { ...o, status: "In Progress" } : o));
    }
  };

  const setResultField = (testName, fieldName, value) => {
    setResultValues(rv => ({
      ...rv,
      [testName]: { ...(rv[testName] || {}), [fieldName]: value },
    }));
  };

  const handleSave = async () => {
    if (!selected) {
      addToast("Please select a lab order first", "error", 2000);
      return;
    }
    setLoading(true);
    try {
      // Build results JSON
      const results = {};
      (selected.tests || []).forEach(t => {
        const fields = TEST_FIELDS[t] || [];
        results[t] = {};
        fields.forEach(f => {
          const val = resultValues[t]?.[f.name] || "";
          results[t][f.name] = { value: val, unit: f.unit, reference_range: f.ref, status: val ? "Entered" : "Pending" };
        });
      });

      const { error } = await saveLabResult(selected.id, selected.patient_id, techName || "Lab Staff", results, techNotes);
      if (error) {
        addToast("Error saving lab results: " + error.message, "error", 4000);
        setLoading(false);
        return;
      }

      addToast("Lab results saved successfully", "success", 2000);
      setOrders(os => os.map(o => o.id === selected.id ? { ...o, status: "Completed" } : o));
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      addToast("Error: " + err.message, "error", 4000);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

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
            <div><p className="panelKicker">Lab technician portal</p><h1 className="panelTitle">{STEPS[step].description}</h1></div>
          </div>
        </div>
      </div>



      {/* Step 0: Orders */}
      {step === 0 && (
        <div className="stackMd">
          {notices.length > 0 && (
            <div className="note">
              <p className="formLabel" style={{ marginBottom: 6 }}>Lab Notices</p>
              <ul className="simpleList">{notices.map(n => <li key={n.id}>• {n.body}</li>)}</ul>
            </div>
          )}

          <div>
            <label className="formLabel">Select Lab Order</label>
            <select className="formSelect" value={selected?.id || ""} onChange={e => {
              const o = orders.find(o => o.id === e.target.value);
              if (o) selectOrder(o);
            }}>
              <option value="">Choose order</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.patients?.name} — {o.tests?.join(", ")} [{o.status}] {o.urgency === "Urgent" ? "🔴" : ""}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="muted"><span className="spinner" /> Loading…</p>}

          {selected && (
            <div className="note noteStrong">
              <p className="formLabel" style={{ marginBottom: 8 }}>Order Details</p>
              <div className="dataRow"><span className="dataKey">Patient</span><span>{selected.patients?.name} ({selected.patients?.age}/{selected.patients?.gender})</span></div>
              <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Doctor</span><span>{selected.doctor_name}</span></div>
              <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Tests</span><span>{selected.tests?.join(", ")}</span></div>
              <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Urgency</span>
                <span className={`badge ${selected.urgency === "Urgent" ? "badgeUrgent" : "badgeDone"}`}>{selected.urgency}</span>
              </div>
              <div className="dataRow" style={{ marginTop: 4 }}><span className="dataKey">Status</span>
                <span className={`badge ${selected.status === "Completed" ? "badgeDone" : selected.status === "In Progress" ? "badgePending" : "badgeUrgent"}`}>{selected.status}</span>
              </div>
            </div>
          )}

          {/* All orders table */}
          {orders.length > 0 && (
            <div className="note">
              <p className="formLabel" style={{ marginBottom: 8 }}>All Lab Orders ({orders.length})</p>
              <table className="labTable">
                <thead><tr><th>Patient</th><th>Tests</th><th>Urgency</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>{o.patients?.name}</td>
                      <td>{o.tests?.join(", ")}</td>
                      <td><span className={`badge ${o.urgency === "Urgent" ? "badgeUrgent" : "badgeDone"}`}>{o.urgency}</span></td>
                      <td><span className={`badge ${o.status === "Completed" ? "badgeDone" : o.status === "In Progress" ? "badgePending" : "badgeUrgent"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Enter results */}
      {step === 1 && (
        <div className="stackMd">
          {!selected && <div className="note">Go back and select a lab order first.</div>}
          {selected && (selected.tests || []).map(testName => {
            const fields = TEST_FIELDS[testName] || [{ name: "Result", unit: "", ref: "" }];
            return (
              <div key={testName} className="note">
                <p className="formLabel" style={{ marginBottom: 10 }}>🔬 {testName}</p>
                <table className="labTable">
                  <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference</th></tr></thead>
                  <tbody>
                    {fields.map(f => (
                      <tr key={f.name}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>
                          <input
                            className="formSelect"
                            style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                            placeholder="Enter value"
                            value={resultValues[testName]?.[f.name] || ""}
                            onChange={e => setResultField(testName, f.name, e.target.value)}
                          />
                        </td>
                        <td className="muted">{f.unit}</td>
                        <td className="muted">{f.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 2: Submit */}
      {step === 2 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Technician Name</label>
            <Input placeholder="Your name" value={techName} onChange={e => setTechName(e.target.value)} />
          </div>
          <div>
            <label className="formLabel">Notes / Observations</label>
            <Textarea placeholder="Any additional observations…" value={techNotes} onChange={e => setTechNotes(e.target.value)} rows={3} />
          </div>

          {selected && (
            <div className="note noteStrong">
              <p className="formLabel" style={{ marginBottom: 8 }}>Results Preview</p>
              {(selected.tests || []).map(t => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{t}</p>
                  {(TEST_FIELDS[t] || []).map(f => (
                    <div key={f.name} className="dataRow" style={{ marginBottom: 3 }}>
                      <span className="dataKey">{f.name}</span>
                      <span>{resultValues[t]?.[f.name] || "—"} {f.unit}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="wizardFooter">
        <Button variant="outline" className="wizardBtn" onClick={() => { setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>Back</Button>
        <Button className="wizardBtn" onClick={() => {
          if (step === 2) { handleSave(); return; }
          setStep(s => s + 1);
        }} disabled={loading}>
          {loading ? <><span className="spinner" /></> : step === 2 ? "Save Results" : <>Next <ArrowRight width={16} height={16} /></>}
        </Button>
      </div>
    </div>
  );
}
