# Portal Update Template - Toast Migration

This template shows how to update the remaining portals to use the toast notification system instead of banner state.

## Pattern to Use in All Portals

### Step 1: Add Import

```javascript
// ADD THIS:
import { useToast } from "@/context/toast.jsx";
```

### Step 2: Add Hook in Component

```javascript
export default function SomePortal({ accentColor, roleIcon: RoleIcon }) {
  // ADD THIS LINE:
  const { addToast } = useToast();
  
  // ... rest of component
```

### Step 3: Remove Banner State

```javascript
// REMOVE THIS LINE:
const [banner, setBanner] = useState(null);
```

### Step 4: Replace All setBanner Calls

**Before:**
```javascript
setBanner({ type: "success", msg: "Item saved ✓" });
setBanner({ type: "error", msg: "Failed to save: " + error.message });
```

**After:**
```javascript
addToast("Item saved", "success", 2000);
addToast("Failed to save: " + error.message, "error", 4000);
```

### Step 5: Remove Banner JSX

**Find this and DELETE it:**
```javascript
{banner && <div className={`note ${banner.type === "success" ? "noteSuccess" : "noteError"}`}>{banner.msg}</div>}
```

---

## Specific Portal Updates

### ReceptionPortal.jsx

**Line ~3:** Add import
```javascript
import { useToast } from "@/context/toast.jsx";
```

**Line ~28:** Add useToast hook
```javascript
const { addToast } = useToast();
```

**Line ~40:** Delete banner state
```javascript
// DELETE: const [banner, setBanner] = useState(null);
```

**Line ~64:** Replace handleRoomSave
```javascript
// FIND:
const handleRoomSave = async () => {
  if (!roomForm.patientId || !roomForm.room) return;
  await upsertRoomAllocation(roomForm.patientId, roomForm.room, roomForm.ward, roomForm.notes);
  setBanner({ type: "success", msg: "Room allocation saved ✓" });
  const r = await getRoomAllocations();
  setRooms(r.data || []);
};

// REPLACE WITH:
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
```

**Line ~73:** Replace handleBillSave
```javascript
// FIND:
const handleBillSave = async () => {
  if (!billForm.patientId) return;
  await upsertBilling(billForm.patientId, {
    totalAmount: Number(billForm.total) || 0,
    paidAmount: Number(billForm.paid) || 0,
    paymentStatus: billForm.status,
    insuranceProvider: billForm.insurance,
  });
  setBanner({ type: "success", msg: "Billing updated ✓" });
};

// REPLACE WITH:
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
```

**Find and DELETE the banner JSX line:**
```javascript
// DELETE THIS LINE:
{banner && <div className={`note ${banner.type === "success" ? "noteSuccess" : "noteError"}`}>{banner.msg}</div>}
```

---

### PharmacistPortal.jsx

**Line ~1:** Add import
```javascript
import { useToast } from "@/context/toast.jsx";
```

**Line ~16:** Add useToast hook
```javascript
const { addToast } = useToast();
```

**Line ~26:** Delete banner state
```javascript
// DELETE: const [banner, setBanner] = useState(null);
```

**Line ~38:** Replace handleDispense
```javascript
// FIND:
const handleDispense = async () => {
  if (!selected) return;
  setLoading(true);
  await markPrescriptionDispensed(selected.id);
  setLoading(false);
  setBanner({ type: "success", msg: "Medicines dispensed ✓" });
  setPrescriptions(ps => ps.map(p => p.id === selected.id ? { ...p, status: "Dispensed" } : p));
};

// REPLACE WITH:
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
```

**Find and DELETE the banner JSX line:**
```javascript
// DELETE THIS LINE:
{banner && <div className={`note ${banner.type === "success" ? "noteSuccess" : "noteError"}`}>{banner.msg}</div>}
```

---

### LabPortal.jsx

**Line ~1:** Add import
```javascript
import { useToast } from "@/context/toast.jsx";
```

**Line ~71:** Add useToast hook (after other hooks)
```javascript
const { addToast } = useToast();
```

**Line ~81:** Delete banner state
```javascript
// DELETE: const [banner, setBanner] = useState(null);
```

**Find handleSave method (around line 105):** Replace with this
```javascript
// FIND: const handleSave = async () => {
// And replace the whole method with:

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

    const { error } = await saveLabResult(selected.id, selected.patient_id, techName, results, techNotes);
    if (error) {
      addToast("Error saving lab results: " + error.message, "error", 4000);
      setLoading(false);
      return;
    }

    addToast("Lab results saved successfully", "success", 2000);
    setTimeout(() => navigate("/"), 2000);
  } catch (err) {
    addToast("Error: " + err.message, "error", 4000);
  } finally {
    setLoading(false);
  }
};
```

**Find and DELETE the banner JSX line:**
```javascript
// DELETE THIS LINE:
{banner && <div className={`note ${banner.type === "success" ? "noteSuccess" : "noteError"}`}>{banner.msg}</div>}
```

---

## PatientPortal.jsx Updates (Comprehensive)

**Before:**
```javascript
import { useState } from "react";
// ... other imports ...

export default function PatientPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  // ...
  const [banner, setBanner] = useState(null);
```

**After:**
```javascript
import { useState } from "react";
import { useToast } from "@/context/toast.jsx";
// ... other imports ...

export default function PatientPortal({ accentColor, roleIcon: RoleIcon }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  // ... remove [banner, setBanner] useState
```

**Update all setBanner calls** to use addToast:
```javascript
// PATTERNS TO FIND & REPLACE:

// Pattern 1:
setBanner({ type: "success", msg: `Patient registered ✓  (ID: ${data.id.slice(0, 8)}…)` });
// Replace with:
addToast(`Patient registered (ID: ${data.id.slice(0, 8)}…)`, "success", 2000);

// Pattern 2:
setBanner({ type: "error", msg: "❌ Database permission denied..." });
// Replace with:
addToast("Database permission denied. Check RLS settings.", "error", 4000);

// Pattern 3:
setBanner({ type: "success", msg: "Appointment booked! ✓ Reception will confirm your slot." });
// Replace with:
addToast("Appointment booked! Reception will confirm your slot.", "success", 2000);
```

**Remove the banner JSX rendering:**
```javascript
// FIND THIS SECTION AND DELETE:
{banner && (
  <div className={`note ${banner.type === "success" ? "noteSuccess" : "noteError"}`}>
    {banner.msg}
  </div>
)}
```

---

## Quick Checklist

For each portal, ensure:

- [ ] Imported `useToast` hook
- [ ] Added `const { addToast } = useToast();` to component
- [ ] Removed `const [banner, setBanner] = useState(null);`
- [ ] Replaced all `setBanner(...)` with `addToast(...)`
- [ ] Removed banner JSX rendering from JSX
- [ ] Added error handling with try-catch
- [ ] Toasts show for 2-4 seconds
- [ ] Component still redirects after success

---

## Testing After Updates

1. Test each portal's main action (e.g., book appointment for Patient)
2. Verify toast appears in top-right corner
3. Verify toast auto-closes after 3 seconds
4. Test error case (e.g., empty form submission)
5. Verify error toast appears and doesn't auto-close immediately

---

## Order of Update Priority

1. ✅ DoctorPortal (DONE)
2. ⏳ ReceptionPortal (TODO)
3. ⏳ PharmacistPortal (TODO)
4. ⏳ LabPortal (TODO)
5. ⏳ PatientPortal (TODO)

---

## Need Help?

Compare your changes against the DoctorPortal.jsx implementation, which has been fully updated with the toast system.
