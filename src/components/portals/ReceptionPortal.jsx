import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, CalendarClock, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/toast.jsx";
import { Input } from "@/ui/Input.jsx";
import { Textarea } from "@/ui/Textarea.jsx";
import { Button } from "@/ui/Button.jsx";
import { Progress } from "@/ui/Progress.jsx";
import { ArrowRight } from "lucide-react";
import {
  getReceptionStats,
  getPatients,
  getRoomAllocations,
  upsertRoomAllocation,
  getBilling,
  upsertBilling,
  getEmergencyAlerts,
  getNotices,
} from "@/lib/hospitalApi.js";

const STEPS = [
  { label: "Overview", description: "Hospital overview", Icon: CalendarClock },
  { label: "Patients", description: "Patient lookup", Icon: User },
  { label: "Rooms", description: "Room allocation", Icon: FileText },
  { label: "Billing", description: "Payment & insurance", Icon: FileText },
];

export default function ReceptionPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [stats, setStats] = useState({ admitted: 0, emergency: 0, totalPatients: 0 });
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [billingRows, setBillingRows] = useState([]);
  const [notices, setNotices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [roomForm, setRoomForm] = useState({ patientId: "", room: "", ward: "", notes: "" });
  const [billForm, setBillForm] = useState({ patientId: "", total: "", paid: "", status: "Pending", insurance: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, p, r, b, n, a] = await Promise.all([
        getReceptionStats(), getPatients(), getRoomAllocations(),
        getBilling(), getNotices("receptionist"), getEmergencyAlerts(),
      ]);
      setStats(s);
      setPatients(p.data || []);
      setRooms(r.data || []);
      setBillingRows(b.data || []);
      setNotices(n.data || []);
      setAlerts(a.data || []);
      setLoading(false);
    })();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const handleRoomSave = async () => {
    if (!roomForm.patientId || !roomForm.room) return;
    try {
      await upsertRoomAllocation(roomForm.patientId, roomForm.room, roomForm.ward, roomForm.notes);
      addToast("Room allocation saved", "success", 2000);
      const r = await getRoomAllocations();
      setRooms(r.data || []);
    } catch (err) {
      addToast("Error: " + err.message, "error", 4000);
    }
  };

  const handleBillSave = async () => {
    if (!billForm.patientId) return;
    try {
      await upsertBilling(billForm.patientId, {
        totalAmount: Number(billForm.total) || 0,
        paidAmount: Number(billForm.paid) || 0,
        paymentStatus: billForm.status,
        insuranceProvider: billForm.insurance,
      });
      addToast("Billing updated", "success", 2000);
    } catch (err) {
      addToast("Error: " + err.message, "error", 4000);
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
            <div><p className="panelKicker">Reception portal</p><h1 className="panelTitle">{STEPS[step].description}</h1></div>
          </div>
        </div>
      </div>



      {/* Step 0: Overview */}
      {step === 0 && (
        <div className="stackMd">
          <div className="statsGrid">
            <div className="statBox"><p className="statValue">{stats.totalPatients}</p><p className="statLabel">Total Patients</p></div>
            <div className="statBox"><p className="statValue">{stats.admitted}</p><p className="statLabel">Admitted</p></div>
            <div className="statBox"><p className="statValue" style={{ color: "hsl(0 80% 60%)" }}>{stats.emergency}</p><p className="statLabel">Emergency</p></div>
            <div className="statBox"><p className="statValue">{rooms.length}</p><p className="statLabel">Rooms Used</p></div>
          </div>

          {alerts.length > 0 && (
            <div className="note noteError">
              <p className="formLabel">🚨 Active Emergency Alerts</p>
              <ul className="simpleList">
                {alerts.map(a => <li key={a.id}>• <strong>{a.patient_name}</strong> — {a.department} — {a.description}</li>)}
              </ul>
            </div>
          )}

          <div className="note">
            <p className="formLabel" style={{ marginBottom: 6 }}>Notices</p>
            <ul className="simpleList">
              {notices.map(n => <li key={n.id}>• {n.body}</li>)}
              {notices.length === 0 && <li>No notices.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Patient lookup */}
      {step === 1 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Search patient (name or phone)</label>
            <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filteredPatients.slice(0, 10).map(p => (
            <div key={p.id} className="dataRow">
              <span><strong>{p.name}</strong> — {p.age}/{p.gender}</span>
              <span className="muted" style={{ fontSize: 13 }}>{p.phone}</span>
            </div>
          ))}
          {filteredPatients.length === 0 && <p className="muted">No patients found.</p>}
        </div>
      )}

      {/* Step 2: Room allocation */}
      {step === 2 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Assign Patient</label>
            <select className="formSelect" value={roomForm.patientId} onChange={e => setRoomForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="formGrid2">
            <div><label className="formLabel">Room Number</label><Input placeholder="e.g. 205" value={roomForm.room} onChange={e => setRoomForm(f => ({ ...f, room: e.target.value }))} /></div>
            <div><label className="formLabel">Ward</label><Input placeholder="e.g. General Ward" value={roomForm.ward} onChange={e => setRoomForm(f => ({ ...f, ward: e.target.value }))} /></div>
          </div>
          <Button onClick={handleRoomSave} style={{ borderRadius: "0.75rem" }}>Save Room Allocation</Button>

          {rooms.length > 0 && (
            <div className="note noteStrong">
              <p className="formLabel" style={{ marginBottom: 8 }}>Current Room Allocations</p>
              {rooms.map(r => (
                <div key={r.id} className="dataRow" style={{ marginBottom: 6 }}>
                  <span><strong>{r.patients?.name}</strong></span>
                  <span>Room {r.room_number} — {r.ward || "—"}</span>
                  <span className="badge badgeDone">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Billing */}
      {step === 3 && (
        <div className="stackMd">
          <div>
            <label className="formLabel">Patient</label>
            <select className="formSelect" value={billForm.patientId} onChange={e => setBillForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="formGrid2">
            <div><label className="formLabel">Total Amount</label><Input type="number" placeholder="₹" value={billForm.total} onChange={e => setBillForm(f => ({ ...f, total: e.target.value }))} /></div>
            <div><label className="formLabel">Paid Amount</label><Input type="number" placeholder="₹" value={billForm.paid} onChange={e => setBillForm(f => ({ ...f, paid: e.target.value }))} /></div>
          </div>
          <div className="formGrid2">
            <div>
              <label className="formLabel">Payment Status</label>
              <select className="formSelect" value={billForm.status} onChange={e => setBillForm(f => ({ ...f, status: e.target.value }))}>
                <option>Pending</option><option>Partial</option><option>Cleared</option>
              </select>
            </div>
            <div><label className="formLabel">Insurance Provider</label><Input placeholder="Provider name" value={billForm.insurance} onChange={e => setBillForm(f => ({ ...f, insurance: e.target.value }))} /></div>
          </div>
          <Button onClick={handleBillSave} style={{ borderRadius: "0.75rem" }}>Save Billing</Button>

          {billingRows.length > 0 && (
            <div className="note noteStrong">
              <p className="formLabel" style={{ marginBottom: 8 }}>Billing Records</p>
              {billingRows.map(b => (
                <div key={b.id} className="dataRow" style={{ marginBottom: 6 }}>
                  <span><strong>{b.patients?.name}</strong></span>
                  <span>₹{b.total_amount} — Paid ₹{b.paid_amount}</span>
                  <span className={`badge ${b.payment_status === "Cleared" ? "badgeDone" : b.payment_status === "Partial" ? "badgePending" : "badgeUrgent"}`}>{b.payment_status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="wizardFooter">
        <Button variant="outline" className="wizardBtn" onClick={() => { setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>Back</Button>
        <Button className="wizardBtn" onClick={() => {
          if (step === STEPS.length - 1) { navigate("/"); return; }
          setStep(s => s + 1);
        }}>
          {step === STEPS.length - 1 ? "Finish & go home" : <>Next <ArrowRight width={16} height={16} /></>}
        </Button>
      </div>
    </div>
  );
}
