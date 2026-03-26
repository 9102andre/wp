/**
 * aiDiagnosis.js – Hybrid rule-based + weighted ML diagnosis engine
 * Works offline; optionally enhanced by Groq API if key available.
 */

// ── Symptom keyword weights per department ─────────────────────────────────
const KEYWORD_WEIGHTS = {
  ENT: {
    high:     { earache: 3, "hearing loss": 4, "ear discharge": 4, tinnitus: 3, "sore throat": 2, "difficulty swallowing": 3, "swollen lymph": 4 },
    moderate: { "nose block": 2, "nasal congestion": 2, sneezing: 1, cold: 1, hoarseness: 2, "ear pain": 2 },
    mild:     { "runny nose": 1, cough: 1, "mild cold": 1, snoring: 1 },
  },
  Cardiology: {
    high:     { "chest pain": 5, "chest tightness": 5, "heart attack": 5, "shortness of breath": 4, "breathlessness": 4, palpitations: 3, "radiating pain": 4, "arm pain": 3, syncope: 4, fainting: 4 },
    moderate: { hypertension: 3, "high bp": 3, "bp fluctuation": 2, fatigue: 2, "irregular heartbeat": 3, edema: 2 },
    mild:     { "minor palpitation": 1, "mild bp": 1, stress: 1 },
  },
  Dermatology: {
    high:     { "severe rash": 4, "spreading rash": 4, blistering: 4, "skin ulcer": 4, "allergic reaction": 3, "anaphylaxis": 5, "skin infection": 3 },
    moderate: { rash: 2, eczema: 2, psoriasis: 2, acne: 1, "skin allergy": 2, urticaria: 2, hives: 2 },
    mild:     { "dry skin": 1, dandruff: 1, "minor rash": 1, itching: 1, "skin irritation": 1 },
  },
  "General Medicine": {
    high:     { "high fever": 4, "persistent fever": 4, vomiting: 3, diarrhea: 3, dehydration: 4, jaundice: 4, "yellow skin": 4, "bloody stool": 5 },
    moderate: { fever: 2, cold: 1, cough: 1, "body pain": 2, weakness: 2, fatigue: 2, headache: 2, nausea: 2 },
    mild:     { "mild fever": 1, "runny nose": 1, sneezing: 1, "mild headache": 1 },
  },
  Gynecology: {
    high:     { "heavy bleeding": 5, "severe cramps": 4, "ectopic pregnancy": 5, "abnormal discharge": 3, "pelvic pain severe": 4, miscarriage: 5 },
    moderate: { "irregular periods": 2, PCOS: 2, "menstrual pain": 2, "vaginal discharge": 2, infertility: 3 },
    mild:     { "mild cramps": 1, "PMS symptoms": 1, bloating: 1 },
  },
  Orthopedics: {
    high:     { fracture: 5, "broken bone": 5, "severe joint pain": 4, dislocation: 5, "cannot walk": 4, "spinal pain": 4 },
    moderate: { "joint pain": 2, "knee pain": 2, "back pain": 2, "muscle pain": 2, arthritis: 2, swelling: 2 },
    mild:     { "minor strain": 1, "mild back pain": 1, stiffness: 1 },
  },
  Pediatrics: {
    high:     { convulsion: 5, seizure: 5, "high fever child": 4, "difficulty breathing child": 5, "not eating": 3, dehydration: 4 },
    moderate: { "fever child": 2, "cold child": 1, "cough child": 2, "stomach pain": 2, vomiting: 2, "growth concern": 2 },
    mild:     { "runny nose child": 1, "mild cough": 1, vaccination: 1 },
  },
};

// ── Remedy & advice per severity ──────────────────────────────────────────
const REMEDIES = {
  High: {
    default: "⚠️ Please visit emergency immediately. Consult a specialist without delay.",
    labTests: ["CBC", "Blood Glucose", "CRP", "ECG", "X-Ray"],
  },
  Moderate: {
    default: "Book an appointment with a specialist within 48 hours. Monitor symptoms closely.",
    advice:  "Take prescribed OTC medication, stay hydrated, and rest well.",
  },
  Mild: {
    default: "Home care is recommended. Consult a doctor if symptoms worsen.",
    remedies: [
      "Steam inhalation and warm fluids for respiratory issues",
      "Turmeric milk or ginger tea for mild inflammation",
      "Rest and hydration for fatigue and fever",
      "Calamine lotion for minor skin irritation",
      "Ice pack for minor swellings",
    ],
  },
};

// Department-specific lab tests for high severity
const DEPT_LAB_TESTS = {
  ENT:              ["CBC", "Throat Culture", "Audiometry"],
  Cardiology:       ["ECG", "Troponin", "Lipid Profile", "Echo"],
  Dermatology:      ["Skin Patch Test", "CBC", "IgE levels"],
  "General Medicine": ["CBC", "LFT", "RFT", "Blood Glucose", "Urine Analysis"],
  Gynecology:       ["Ultrasound", "HCG", "CBC", "Hormonal Panel"],
  Orthopedics:      ["X-Ray", "MRI", "CBC", "Calcium Levels"],
  Pediatrics:       ["CBC", "Blood Culture", "Blood Glucose", "Urine Analysis"],
};

// Department-specific medication suggestions (for moderate/mild)
const DEPT_MEDICATIONS = {
  ENT:              ["Amoxicillin (if bacterial)", "Ibuprofen", "Nasal saline rinse", "ORS"],
  Cardiology:       ["Aspirin (under doctor supervision)", "Beta-blockers (prescribed)", "Nitroglycerine (emergency)"],
  Dermatology:      ["Cetirizine 10mg", "Hydrocortisone cream", "Calamine lotion", "Moisturizer"],
  "General Medicine": ["Paracetamol 500mg", "ORS", "Vitamin C", "Rest + Fluids"],
  Gynecology:       ["Mefenamic acid (cramps)", "Iron supplements", "Folic acid"],
  Orthopedics:      ["Diclofenac gel", "Ibuprofen", "Calcium + Vit D supplements"],
  Pediatrics:       ["Paracetamol syrup (age-adjusted)", "ORS", "Vitamin D drops"],
};

/**
 * scoreSymptoms – compute weighted symptom score
 * @param {string} symptoms
 * @param {string} department
 * @returns {{ highScore: number, moderateScore: number, mildScore: number }}
 */
function scoreSymptoms(symptoms, department) {
  const lower = (symptoms || "").toLowerCase();
  const deptWeights = KEYWORD_WEIGHTS[department] || KEYWORD_WEIGHTS["General Medicine"];

  const compute = (category) => {
    const kws = deptWeights[category] || {};
    return Object.entries(kws).reduce((sum, [kw, weight]) => {
      return sum + (lower.includes(kw) ? weight : 0);
    }, 0);
  };

  return {
    highScore:     compute("high"),
    moderateScore: compute("moderate"),
    mildScore:     compute("mild"),
  };
}

/**
 * calculateSeverity – determine severity level
 * Combines slider score (1-10) + keyword matching
 * @returns {{ level: "High"|"Moderate"|"Mild", confidence: number }}
 */
function calculateSeverity(sliderValue, scores) {
  // sliderValue: 1-10
  // Normalize slider to 0-10 contribution
  const sliderContrib = sliderValue;

  // Keyword contribution (normalized to 0-10 scale)
  const keywordContrib = Math.min(10,
    scores.highScore * 2 + scores.moderateScore * 0.8 + scores.mildScore * 0.3
  );

  const combined = sliderContrib * 0.55 + keywordContrib * 0.45;

  let level;
  let confidence;

  if (combined >= 7.5 || scores.highScore >= 4) {
    level = "High";
    confidence = Math.min(0.98, 0.78 + (scores.highScore * 0.03) + (sliderValue >= 8 ? 0.08 : 0));
  } else if (combined >= 4.5 || scores.moderateScore >= 3) {
    level = "Moderate";
    confidence = Math.min(0.95, 0.72 + (scores.moderateScore * 0.03));
  } else {
    level = "Mild";
    confidence = Math.min(0.92, 0.65 + (scores.mildScore * 0.04));
  }

  return { level, confidence: parseFloat(confidence.toFixed(2)) };
}

/**
 * runLocalDiagnosis – full local AI diagnosis
 */
export function runLocalDiagnosis({ department, symptoms, severity: sliderValue, history, allergies }) {
  const dept = department || "General Medicine";
  const scores = scoreSymptoms(symptoms, dept);
  const { level, confidence } = calculateSeverity(Number(sliderValue) || 5, scores);

  const labTests = level === "High"
    ? DEPT_LAB_TESTS[dept] || REMEDIES.High.labTests
    : [];

  const medications = DEPT_MEDICATIONS[dept] || [];

  let recommendation = "";
  let diagnosisText = "";
  let remedies = [];

  if (level === "High") {
    recommendation = REMEDIES.High.default;
    diagnosisText = `🔴 HIGH SEVERITY – Emergency consultation required.\n\nBased on the symptoms described (${symptoms || "not specified"}), this appears to be a HIGH severity case in ${dept}.\n\nRecommended lab tests: ${labTests.join(", ")}.\n\nDo not delay – seek immediate medical attention.`;
    if (history) diagnosisText += `\n\nNote: Patient has history of: ${history}`;
    if (allergies) diagnosisText += `\n⚠️ Known allergies: ${allergies}`;
  } else if (level === "Moderate") {
    recommendation = REMEDIES.Moderate.default;
    diagnosisText = `🟡 MODERATE SEVERITY – Specialist consultation recommended.\n\nSymptoms in department ${dept} indicate a moderate-severity condition.\n\nSuggested medications (consult doctor first): ${medications.slice(0, 3).join(", ")}.\n\n${REMEDIES.Moderate.advice}`;
    if (history) diagnosisText += `\n\nHistory: ${history}`;
    if (allergies) diagnosisText += `\n⚠️ Allergies: ${allergies} – adjust medications accordingly.`;
  } else {
    recommendation = REMEDIES.Mild.default;
    remedies = REMEDIES.Mild.remedies.slice(0, 3);
    diagnosisText = `🟢 MILD SEVERITY – Home care advised.\n\nYour symptoms in ${dept} appear mild. Self-care tips:\n• ${remedies.join("\n• ")}\n\nSuggested OTC: ${medications.slice(-2).join(", ")}.\n\nMonitor symptoms and see a doctor if no improvement in 5-7 days.`;
  }

  return {
    severity:      level,
    recommendation,
    confidence,
    diagnosisText,
    labTests,
    medications,
    remedies,
    scores,
  };
}

/**
 * runAIDiagnosis – main entry point
 * Tries Groq API first (if env key configured), falls back to local
 */
export async function runAIDiagnosis(formData) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (groqKey) {
    try {
      const result = await callGroqDiagnosis(formData, groqKey);
      if (result) return result;
    } catch {
      // silent fallback
    }
  }

  // Use local engine
  return runLocalDiagnosis(formData);
}

async function callGroqDiagnosis(formData, apiKey) {
  const prompt = `You are a medical AI assistant for a hospital triage system. Given the following patient information, provide a structured clinical assessment as JSON.

Patient Department: ${formData.department}
Symptoms: ${formData.symptoms}
Duration: ${formData.duration}
Severity (patient reported 1-10): ${formData.severity}
Medical History: ${formData.history || "None"}
Allergies: ${formData.allergies || "None"}

Respond ONLY with valid JSON (no markdown):
{
  "severity": "High|Moderate|Mild",
  "recommendation": "One clear sentence on what the patient should do immediately",
  "confidence": 0.XX,
  "diagnosisText": "2-3 concise sentences summarising the likely condition",
  "labTests": ["test1", "test2"],
  "medications": ["med1 — dosage/usage note", "med2"],
  "remedies": ["home care tip 1", "home care tip 2"]
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error("Groq API error");

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Groq response");

  const parsed = JSON.parse(match[0]);
  return {
    severity:      parsed.severity || "Moderate",
    recommendation: parsed.recommendation || "",
    confidence:    parsed.confidence || 0.80,
    diagnosisText: parsed.diagnosisText || "",
    labTests:      parsed.labTests || [],
    medications:   parsed.medications || [],
    remedies:      [],
  };
}
