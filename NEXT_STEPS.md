# WeCare Healthcare System - Next Steps Action Plan

**Current Status:** Phase 1 Complete - Ready for Testing

---

## 🚀 Critical Path (Do This First)

### Step 1: Run Supabase Migrations (5 minutes)

**Why:** Sets up the `auth_users` table needed for role storage

```bash
1. Go to Supabase Dashboard
2. Click "SQL Editor" 
3. Copy the entire contents of:
   supabase/migrations/002_add_auth_users.sql
4. Paste into SQL Editor
5. Click "Run"
```

**Expected Result:** You'll see "Success" message and `auth_users` table appears in Schema

---

### Step 2: Test Authentication Flow (10 minutes)

**Setup:**
```bash
# Terminal 1 - Backend
cd server
./start_server.bat  # Windows
# or
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Verify: http://localhost:8000 returns home page

# Terminal 2 - Frontend
npm install
npm run dev
# Opens http://localhost:5173
```

**Test Cases:**
1. ✏️ Open home page
2. ✏️ Scroll to "Access Portal" section
3. ✏️ Select role "Patient"
4. ✏️ Click "Sign in with Google"
5. ✏️ Sign in with your Google account
6. ✏️ Should redirect to `/login/patient`
7. ✏️ Verify navbar shows your profile
8. ✏️ Click profile → see dropdown menu
9. ✏️ Verify role shows "Patient"
10. ✏️ Click "Logout" → redirects to home

**If Something Fails:**
- Check browser console (F12) for errors
- Check terminal for backend errors
- Verify `.env` has correct Firebase/Supabase keys
- See `SETUP.md` for troubleshooting

---

### Step 3: Test Role-Based Access (5 minutes)

**Test Cases:**

1. **Patient Login Works:**
   ```
   Sign in as patient → /login/patient → Patient Portal ✓
   ```

2. **Doctor Can't Access Wrong Portal:**
   ```
   Sign in as doctor
   Try to manually go to /login/patient
   Should redirect to /login/doctor ✓
   ```

3. **Data is Filtered:**
   ```
   Patient sees ONLY their own records ✓
   Doctor sees ALL patient records ✓
   ```

---

## 📋 Next: Update Remaining Portals (30 minutes)

**Files to Update:**
1. `src/components/portals/ReceptionPortal.jsx`
2. `src/components/portals/PharmacistPortal.jsx`
3. `src/components/portals/LabPortal.jsx`
4. `src/components/portals/PatientPortal.jsx`

**For Each File:**
1. Open the file
2. Follow the pattern in `PORTAL_UPDATE_TEMPLATE.md`
3. Key changes:
   - Add `import { useToast } from "@/context/toast.jsx";`
   - Add `const { addToast } = useToast();` in component
   - Replace `setBanner()` with `addToast()`
   - Remove banner useState
   - Delete banner JSX rendering

**Verification:**
```bash
npm run dev
# Test each portal's main action
# Verify toast notifications appear
# Toast should disappear after 3 seconds
```

---

## 🔧 Optional Enhancements (In Order)

### A. Email Verification (10 minutes)

```javascript
// In src/context/auth.jsx, add:

if (firebaseUser) {
  if (!firebaseUser.emailVerified) {
    // Show verification message
    const sendVerification = async () => {
      await sendEmailVerification(firebaseUser);
      addToast("Verification email sent", "success");
    };
    // You could show UI prompt to send verification
  }
}
```

### B. Map Integration (15 minutes)

```bash
npm install leaflet react-leaflet
```

```javascript
// Create src/components/ContactMap.jsx

import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export function ContactMap() {
  const center = [13.0827, 80.2707]; // Chennai
  return (
    <MapContainer center={center} zoom={13} style={{ height: "600px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={center} />
    </MapContainer>
  );
}
```

### C. UI Improvements (20 minutes)

In `src/components/portals/PatientPortal.jsx`, Step 3 (Diagnosis):

```javascript
// Make AI results bigger and more visible
{aiResult && (
  <div style={{
    padding: "2rem",
    background: aiResult.severity === "High" ? "hsl(0 90% 90%)" : "hsl(var(--card))",
    border: `4px solid ${aiResult.severity === "High" ? "red" : "green"}`,
    borderRadius: "1rem",
  }}>
    <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
      {aiResult.severity} Severity
    </h2>
    <p style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
      {aiResult.diagnosisText}
    </p>
  </div>
)}
```

### D. Backend Health Check (5 minutes)

In `server/main.py`, add:

```python
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0"}
```

---

## ✔️ Verification Checklist

### Authentication
- [ ] User can sign in with Google
- [ ] User redirected to correct role portal
- [ ] User profile visible in navbar
- [ ] Can logout from profile menu
- [ ] Session persists after page refresh

### Role-Based Access
- [ ] Patient can only access patient portal
- [ ] Doctor can only access doctor portal
- [ ] Wrong role redirects to correct portal
- [ ] Data filtered by role (verify in code)

### Data Flow
- [ ] Lab tech can upload results
- [ ] Doctor can see lab tech results
- [ ] Patient can only see own results
- [ ] No cross-role data leakage

### Toast System  
- [ ] Success toast appears (green)
- [ ] Error toast appears (red)
- [ ] Toast disappears after 3 seconds
- [ ] Multiple toasts queue properly

### Remaining Portals
- [ ] ReceptionPortal updated with toasts
- [ ] PharmacistPortal updated with toasts
- [ ] LabPortal updated with toasts
- [ ] PatientPortal updated with toasts

---

## 📚 Documentation Reference

### For Setup Questions:
→ Read `SETUP.md`

### For Technical Details:
→ Read `IMPLEMENTATION_SUMMARY.md`

### For Portal Updates:
→ Read `PORTAL_UPDATE_TEMPLATE.md`

### For Overall Status:
→ Read `README_FIXES_COMPLETED.md`

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Run migrations | 5 min | CRITICAL |
| Test auth flow | 10 min | CRITICAL |
| Test role access | 5 min | CRITICAL |
| Update 4 portals | 30 min | HIGH |
| Email verification | 10 min | MEDIUM |
| Map integration | 15 min | MEDIUM |
| UI improvements | 20 min | LOW |
| Backend health check | 5 min | LOW |

**Total: ~90 minutes** for everything

---

## 🚨 If Something Goes Wrong

### Error: "Cannot reach database"
```bash
# Check:
1. Supabase URL in .env is correct
2. API key in .env is correct
3. Internet connection works
4. Supabase dashboard is online
```

### Error: "Google sign-in fails"
```bash
# Check:
1. Go to Firebase Console
2. Authentication → Google Provider
3. Add http://localhost:5173 to redirect URIs
4. Wait 5 minutes for changes to propagate
5. Clear browser cache and try again
```

### Error: "Role redirect loop"
```bash
# This means auth context isn't setting role properly
1. Check browser console (F12) for errors
2. Check that migrations ran successfully
3. Check auth_users table has the user
4. Stop/start dev server
```

### Error: "Toast not showing"
```bash
# Make sure:
1. ToastProvider is in App.jsx
2. useToast() is called AFTER wrapping with ToastProvider
3. Component is inside BrowserRouter
```

---

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ Can sign in with Google
2. ✅ Redirected to correct role portal
3. ✅ Navbar shows user profile
4. ✅ Can logout
5. ✅ Session persists after refresh
6. ✅ Role-based data is visible
7. ✅ Toast notifications appear
8. ✅ All 4 portals have toasts

---

## 📞 Quick Help

| Issue | Solution | Time |
|-------|----------|------|
| Auth not working | Check Firebase credentials in .env | 2 min |
| Database errors | Run migration again | 5 min |
| Toast not showing | Check ToastProvider in App.jsx | 2 min |
| Role redirect wrong | Clear localStorage, restart server | 3 min |
| Portal UI broken | Compare with DoctorPortal.jsx | 5 min |

---

## 🎉 What To Do After Everything Works

1. Deploy to staging environment
2. Invite test users (different roles)
3. Run through all user workflows
4. Gather feedback
5. Fix any issues
6. Deploy to production

---

## 📝 Notes

- **Bun vs NPM:** `bun install && bun dev` equivalent to `npm install && npm run dev`
- **Backend Port:** Must be 8000 for frontend API calls
- **Frontend Port:** Can be any port, default 5173
- **Database:** Supabase handles all setup, just run migrations
- **Firebase:** OAuth redirect must match exactly, whitespace matters

---

**Ready to proceed!** Start with Step 1 above. 🚀

If you have questions, check the documentation files in the project root.
