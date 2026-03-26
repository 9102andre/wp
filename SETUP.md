# WeCare Healthcare System - Setup Guide

This guide will help you set up the WeCare Healthcare System for development and testing.

## Prerequisites

- Node.js >= 18
- Python >= 3.10
- Supabase account (https://supabase.com)
- Firebase project (https://firebase.google.com)
- Bun package manager (recommended) or npm

## 1. Environment Setup

### 1.1 Frontend Environment Variables

The `.env` file is already configured with:
- Supabase credentials (URL, API key)
- Firebase credentials (API key, auth domain, project ID)
- Google AI API key (GROQ)

**Verify** these are correct:
```bash
cat .env
```

### 1.2 Backend Server

The backend runs on **port 8000** with FastAPI.

To start:
```bash
cd server
# On Windows
start_server.bat

# On Linux/Mac
python -m venv .venv
source .venv/bin/activate  # or . .venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at: `http://localhost:8000`

## 2. Database Setup (Supabase)

### 2.1 Run Migrations

1. Go to Supabase Console
2. Open SQL Editor
3. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_auth_users.sql`

### 2.2 Verify Tables

After running migrations, verify these tables exist:
- `auth_users` - User roles and metadata
- `patients` - Patient records
- `encounters` - Symptom records
- `appointments` - Appointment bookings
- `prescriptions` - Prescriptions
- `lab_orders` - Lab test orders
- `lab_results` - Lab test results
- `room_allocations` - Hospital bed assignments
- `billing` - Billing records
- `emergency_alerts` - Critical alerts
- `notices` - System notices

### 2.3 Disable Row-Level Security (RLS) for Testing

RLS is enabled on all tables for production. For testing/development:

1. Go to Supabase Console → Authentication → Policies
2. You can optionally disable RLS policies for testing
3. **Important**: Re-enable for production!

Or run in Supabase SQL Editor:
```sql
-- Disable RLS for testing (tables already have public policies)
-- RLS is already set but with public policies enabled
```

## 3. Firebase Setup

### 3.1 Enable Google OAuth

1. Go to Firebase Console
2. Authentication → Sign-in methods
3. Enable Google sign-in
4. Add authorized redirect URIs:
   - `http://localhost:5173` (dev)
   - Your production domain

### 3.2 OAuth Redirect Configuration

The auth flow:
1. User clicks "Sign in with Google"
2. Firebase redirects to Google sign-in
3. After signing in, user returns to `/auth/callback`
4. Auth context picks up the session
5. User is redirected to their role portal

## 4. Frontend Setup

### 4.1 Install Dependencies

```bash
npm install
# or
bun install
```

### 4.2 Start Development Server

```bash
npm run dev
# or
bun dev
```

The app will be available at: `http://localhost:5173`

### 4.3 Test Login Flow

1. Go to home page
2. Scroll to "Access Portal" section
3. Select a role (Patient, Doctor, etc.)
4. Click "Sign in with Google"
5. Sign in with your Google account
6. You should be redirected to the role portal

## 5. System Architecture

### Authentication Flow

```
1. User selects role on home page
2. Clicks "Sign in with Google"
3. Firebase redirects to Google OAuth
4. Google redirects back to /auth/callback
5. Auth context listens for onAuthStateChanged
6. User info + role stored in localStorage
7. User role stored in Supabase (auth_users table)
8. ProtectedRoute component validates access
9. User redirected to role-specific portal
```

### Authorization & Data Access

**Role-Based Access:**

- **Patient**: Can view only their own records
- **Doctor**: Can view all patient records, lab results, prescriptions
- **Receptionist**: Can view appointments, manage patient registrations
- **Lab Technician**: Can upload lab results, view lab orders
- **Pharmacist**: Can view prescriptions, mark as dispensed

**Data Flow for Lab Results:**

1. Lab Tech uploads results to `lab_results` table
2. Doctor queries `lab_results` table
3. Doctor sees all lab results (not just for their patients)

## 6. Troubleshooting

### Issue: "Cannot reach the database"

**Solution:** Check:
- Supabase URL is correct in .env
- Supabase API key is valid
- Internet connection is active

### Issue: "Database permission denied"

**Solution:**
- RLS policies may be too restrictive
- Run the Supabase migrations
- Check that tables have public read/write policies

### Issue: Google sign-in not working

**Solution:**
- Verify Firebase credentials in .env
- Check Google OAuth redirect URIs in Firebase Console
- Use `http://localhost:5173` for development

### Issue: Backend server not responding

**Solution:**
- Check if server is running: `curl http://localhost:8000`
- Restart server with: `uvicorn main:app --reload`
- Verify port 8000 is not in use: `lsof -i :8000` (Linux/Mac)

### Issue: Toast notifications not showing

**Solution:**
- Ensure ToastProvider is wrapped in App.jsx
- Check browser console for errors

## 7. Important Security Notes

⚠️ **BEFORE PRODUCTION:**

1. **Disable public RLS policies** - Replace with user-specific policies
2. **Update CORS settings** - Set allowed origins to production domain only
3. **Enable email verification** - Add email verification after signup
4. **Use environment secrets** - Never commit .env to git
5. **Set up SSL/TLS** - Use HTTPS in production
6. **Database backups** - Enable Supabase automatic backups
7. **API rate limiting** - Implement rate limits on backend

## 8. Default Test Users

After running migrations, test with these Firebase UIDs:

- Patient: `test-patient-001` (patient1@example.com)
- Doctor: `test-doctor-001` (doctor1@example.com)
- Receptionist: `test-receptionist-001` (reception@example.com)
- Lab Tech: `test-lab-001` (lab@example.com)
- Pharmacist: `test-pharmacist-001` (pharmacy@example.com)

**Note:** These are stored in Supabase. To use with Firebase, you need to create Firebase users with matching UIDs or use the actual Google auth flow.

## 9. Key Files Reference

- **Frontend Routes**: `src/App.jsx`
- **Auth Context**: `src/context/auth.jsx`
- **Protected Routes**: `src/components/ProtectedRoute.jsx`
- **Toast System**: `src/context/toast.jsx`
- **API Layer**: `src/lib/hospitalApi.js`
- **Portals**: `src/components/portals/`
- **Backend**: `server/main.py`
- **Database Schema**: `supabase/migrations/`

## 10. Next Steps

1. ✅ Set up environment variables
2. ✅ Run Supabase migrations
3. ✅ Configure Firebase OAuth
4. ✅ Start backend server
5. ✅ Install frontend dependencies
6. ✅ Start frontend dev server
7. ✅ Test authentication flow
8. ✅ Test role-based access
9. ✅ Verify data filtering by role
10. ✅ Deploy to production (with security updates)

## Support

For issues or questions:
- Check Supabase docs: https://supabase.io/docs
- Check Firebase docs: https://firebase.google.com/docs
- Review code comments in source files
