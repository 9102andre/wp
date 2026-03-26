/**
 * hospitalApi.js – Supabase data layer for Hospital Management System
 * All functions return { data, error } to match Supabase convention.
 */
import { supabase } from "@/integrations/supabase/client.js";

const ENCOUNTER_BUCKET = "encounter-files";

function safeFileExt(name) {
  const parts = String(name || "").split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase().slice(0, 10) : "bin";
}

// ─── HELPER: Get current user from auth_users table ────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from("auth_users")
    .select("*")
    .eq("uid", user.id)
    .single();

  return userData;
}

// ─── PATIENTS ──────────────────────────────────────────────────────────────

export async function registerPatient(formData) {
  const { data, error } = await supabase
    .from("patients")
    .insert([{
      name:              formData.name,
      age:               Number(formData.age),
      gender:            formData.gender,
      phone:             formData.phone,
      email:             formData.email,
      address:           formData.address,
      emergency_contact: formData.emergencyContact,
    }])
    .select()
    .single();
  return { data, error };
}

export async function getPatients() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Get patients for a specific role
 * DOCTOR: can see all patients
 * RECEPTIONIST: can see all patients
 * PATIENT: can only see their own record
 */
export async function getPatientsByRole(role, userId = null) {
  if (role === "doctor" || role === "receptionist") {
    // These roles can see all patients
    return getPatients();
  } else if (role === "patient" && userId) {
    // Patients can only see their own record
    return getPatientById(userId);
  }
  return { data: [], error: null };
}

export async function getPatientById(id) {
  const { data, error } = await supabase
    .from("patients")
    .select("*, encounters(*), appointments(*)")
    .eq("id", id)
    .single();
  return { data, error };
}

// ─── ENCOUNTERS ────────────────────────────────────────────────────────────

export async function createEncounter(patientId, formData, aiResult) {
  const { data, error } = await supabase
    .from("encounters")
    .insert([{
      patient_id:          patientId,
      department:          formData.department,
      symptoms:            formData.symptoms,
      duration:            formData.duration,
      severity:            Number(formData.severity),
      history:             formData.history,
      allergies:           formData.allergies,
      ai_severity:         aiResult.severity,
      ai_recommendation:   aiResult.recommendation,
      ai_confidence:       aiResult.confidence,
      ai_diagnosis_text:   aiResult.diagnosisText,
    }])
    .select()
    .single();
  return { data, error };
}

export async function uploadEncounterFiles({ patientId, encounterId, files }) {
  const uploaded = [];

  for (const f of files || []) {
    const ext = safeFileExt(f.name);
    const path = `${patientId}/${encounterId}/${crypto.randomUUID()}.${ext}`;

    const up = await supabase.storage.from(ENCOUNTER_BUCKET).upload(path, f, {
      upsert: false,
      contentType: f.type || undefined,
    });

    if (up.error) return { data: null, error: up.error };

    const pub = supabase.storage.from(ENCOUNTER_BUCKET).getPublicUrl(path);
    uploaded.push({
      file_path: path,
      public_url: pub.data.publicUrl,
      file_name: f.name,
      mime_type: f.type,
    });

    const ins = await supabase.from("encounter_files").insert([
      {
        patient_id: patientId,
        encounter_id: encounterId,
        file_path: path,
        file_name: f.name,
        mime_type: f.type,
      },
    ]);

    if (ins.error) return { data: null, error: ins.error };
  }

  return { data: uploaded, error: null };
}

export async function getEncounterFiles(encounterId) {
  const { data, error } = await supabase
    .from("encounter_files")
    .select("*")
    .eq("encounter_id", encounterId)
    .order("uploaded_at", { ascending: false });

  return { data, error };
}

export async function getEncountersByPatient(patientId) {
  const { data, error } = await supabase
    .from("encounters")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────

export async function createAppointment(patientId, encounterId, formData) {
  const { data, error } = await supabase
    .from("appointments")
    .insert([{
      patient_id:    patientId,
      encounter_id:  encounterId,
      department:    formData.department,
      doctor_name:   formData.doctor,
      appt_date:     formData.appointmentDate,
      appt_time:     formData.appointmentTime,
      status:        "Scheduled",
    }])
    .select()
    .single();
  return { data, error };
}

export async function getTodaysAppointments() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name, age, gender)")
    .eq("appt_date", today)
    .order("appt_time", { ascending: true });
  return { data, error };
}

export async function getAppointmentsWithPatients() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name, age, gender, phone)")
    .order("created_at", { ascending: false })
    .limit(30);
  return { data, error };
}

export async function updateAppointmentStatus(id, status, notes) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status, notes })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────

export async function createPrescription(patientId, encounterId, doctorName, diagnosisText, medicines) {
  const { data, error } = await supabase
    .from("prescriptions")
    .insert([{
      patient_id:     patientId,
      encounter_id:   encounterId,
      doctor_name:    doctorName,
      diagnosis_text: diagnosisText,
      medicines:      medicines,
      status:         "Pending",
    }])
    .select()
    .single();
  return { data, error };
}

export async function getPrescriptionsForPharmacy() {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*, patients(name, age, gender)")
    .order("created_at", { ascending: false })
    .limit(50);
  return { data, error };
}

/**
 * Get prescriptions for a specific role
 * DOCTOR: can see all prescriptions they wrote
 * PATIENT: can only see their own prescriptions
 * PHARMACIST: can see all prescriptions
 */
export async function getPrescriptionsByRole(role, userId = null) {
  if (role === "pharmacist") {
    return getPrescriptionsForPharmacy();
  } else if (role === "patient" && userId) {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*, patients(name, age, gender)")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  }
  return { data: [], error: null };
}

export async function markPrescriptionDispensed(id) {
  const { data, error } = await supabase
    .from("prescriptions")
    .update({ status: "Dispensed", dispensed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ─── LAB ORDERS ─────────────────────────────────────────────────────────────

export async function createLabOrder(patientId, encounterId, doctorName, tests, urgency, notes) {
  const { data, error } = await supabase
    .from("lab_orders")
    .insert([{
      patient_id:   patientId,
      encounter_id: encounterId,
      doctor_name:  doctorName,
      tests,
      urgency:      urgency || "Normal",
      notes,
      status:       "Pending",
    }])
    .select()
    .single();
  return { data, error };
}

export async function getLabOrders() {
  const { data, error } = await supabase
    .from("lab_orders")
    .select("*, patients(name, age, gender)")
    .order("created_at", { ascending: false })
    .limit(50);
  return { data, error };
}

/**
 * Get lab orders for a specific role
 * DOCTOR: can see all lab orders  
 * LAB_TECHNICIAN: can see all lab orders
 * PATIENT: can only see their own lab orders
 */
export async function getLabOrdersByRole(role, userId = null) {
  if (role === "doctor" || role === "lab") {
    return getLabOrders();
  } else if (role === "patient" && userId) {
    const { data, error } = await supabase
      .from("lab_orders")
      .select("*, patients(name, age, gender)")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  }
  return { data: [], error: null };
}

export async function updateLabOrderStatus(id, status) {
  const { data, error } = await supabase
    .from("lab_orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ─── LAB RESULTS ─────────────────────────────────────────────────────────────

export async function saveLabResult(labOrderId, patientId, technician, results, notes) {
  const { data, error } = await supabase
    .from("lab_results")
    .insert([{
      lab_order_id: labOrderId,
      patient_id:   patientId,
      technician,
      results,
      notes,
      completed_at: new Date().toISOString(),
    }])
    .select()
    .single();
  // also mark order as completed
  if (!error) {
    await supabase.from("lab_orders").update({ status: "Completed" }).eq("id", labOrderId);
  }
  return { data, error };
}

export async function getLabResultsByPatient(patientId) {
  const { data, error } = await supabase
    .from("lab_results")
    .select("*, lab_orders(tests, doctor_name, urgency)")
    .eq("patient_id", patientId)
    .order("completed_at", { ascending: false });
  return { data, error };
}

/**
 * Get lab results for a specific role
 * DOCTOR: can see all lab results
 * LAB_TECHNICIAN: can see all lab results
 * PATIENT: can only see their own lab results
 */
export async function getLabResultsByRole(role, userId = null) {
  if (role === "doctor" || role === "lab") {
    const { data, error } = await supabase
      .from("lab_results")
      .select("*, lab_orders(tests, doctor_name, urgency), patients(name, age, gender)")
      .order("completed_at", { ascending: false });
    return { data, error };
  } else if (role === "patient" && userId) {
    return getLabResultsByPatient(userId);
  }
  return { data: [], error: null };
}

// ─── ROOM ALLOCATIONS ────────────────────────────────────────────────────────

export async function upsertRoomAllocation(patientId, roomNumber, ward, notes) {
  // upsert by patient_id + status='Admitted'
  const { data: existing } = await supabase
    .from("room_allocations")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "Admitted")
    .maybeSingle();

  if (existing) {
    return supabase
      .from("room_allocations")
      .update({ room_number: roomNumber, ward, notes })
      .eq("id", existing.id)
      .select()
      .single();
  }
  return supabase
    .from("room_allocations")
    .insert([{ patient_id: patientId, room_number: roomNumber, ward, notes, status: "Admitted" }])
    .select()
    .single();
}

export async function getRoomAllocations() {
  const { data, error } = await supabase
    .from("room_allocations")
    .select("*, patients(name, age, gender, phone)")
    .eq("status", "Admitted")
    .order("admitted_at", { ascending: false });
  return { data, error };
}

// ─── BILLING ─────────────────────────────────────────────────────────────────

export async function getBilling() {
  const { data, error } = await supabase
    .from("billing")
    .select("*, patients(name)")
    .order("created_at", { ascending: false })
    .limit(30);
  return { data, error };
}

export async function upsertBilling(patientId, { totalAmount, paidAmount, paymentStatus, insuranceProvider, insuranceId, items }) {
  const { data: existing } = await supabase
    .from("billing")
    .select("id")
    .eq("patient_id", patientId)
    .maybeSingle();

  const payload = {
    total_amount:       totalAmount,
    paid_amount:        paidAmount,
    payment_status:     paymentStatus,
    insurance_provider: insuranceProvider,
    insurance_id:       insuranceId,
    items,
    updated_at:         new Date().toISOString(),
  };

  if (existing) {
    return supabase.from("billing").update(payload).eq("id", existing.id).select().single();
  }
  return supabase.from("billing").insert([{ patient_id: patientId, ...payload }]).select().single();
}

// ─── EMERGENCY ALERTS ────────────────────────────────────────────────────────

export async function createEmergencyAlert(patientId, patientName, department, severity, description) {
  const { data, error } = await supabase
    .from("emergency_alerts")
    .insert([{ patient_id: patientId, patient_name: patientName, department, severity, description }])
    .select()
    .single();
  return { data, error };
}

export async function getEmergencyAlerts() {
  const { data, error } = await supabase
    .from("emergency_alerts")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function resolveEmergencyAlert(id) {
  return supabase.from("emergency_alerts").update({ resolved: true }).eq("id", id).select().single();
}

// ─── NOTICES ─────────────────────────────────────────────────────────────────

export async function getNotices(role) {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .or(`role.eq.${role},role.eq.all`)
    .order("created_at", { ascending: false })
    .limit(10);
  return { data, error };
}

// ─── AGGREGATES (for reception) ──────────────────────────────────────────────

export async function getReceptionStats() {
  const [admitted, emergency, totalPatients] = await Promise.all([
    supabase.from("room_allocations").select("id", { count: "exact", head: true }).eq("status", "Admitted"),
    supabase.from("emergency_alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("patients").select("id", { count: "exact", head: true }),
  ]);
  return {
    admitted:      admitted.count ?? 0,
    emergency:     emergency.count ?? 0,
    totalPatients: totalPatients.count ?? 0,
  };
}
