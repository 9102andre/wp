import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Analyzes patient symptoms and returns triage recommendation.
 */
export async function analyzeSymptoms(data) {
  const prompt = `
    Analyze the following patient health details and provide a triage recommendation.
    Patient Name: ${data.name}
    Age: ${data.age}
    Gender: ${data.gender}
    Department: ${data.department}
    Symptoms: ${data.symptoms}
    Duration: ${data.duration}
    Severity (1-10): ${data.severity}
    History: ${data.history || "None"}
    Allergies: ${data.allergies || "None"}

    Return ONLY a JSON object with this exact format:
    {
      "severity": "Mild" | "Moderate" | "High",
      "recommendation": "Short triage advice string",
      "confidence": 0.0 to 1.0,
      "summary": "Brief summary of the case"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("ML Error (Symptom Analyzer):", error);
    return null;
  }
}

/**
 * Generates a clinical diagnosis and treatment plan for doctors.
 */
export async function generateDiagnosis(patientData, findings) {
  const prompt = `
    Role: Senior Clinical Assistant AI.
    Provide a professional diagnosis and treatment plan based on:
    Patient: ${patientData.name}, Age ${patientData.age}
    Chief Complaint: ${patientData.symptoms}
    Clinical Findings: ${findings}

    Include:
    1. Primary Diagnosis
    2. Suggested Medications
    3. Suggested Lab Tests
    4. Follow-up instructions

    Format: Professional markdown.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("ML Error (Diagnosis):", error);
    return "Error generating AI diagnosis.";
  }
}

/**
 * Checks for drug-drug interactions and dosage alerts.
 */
export async function checkInteractions(patientData, medicines) {
  const prompt = `
    Role: Clinical Pharmacist AI.
    Check for potential drug-drug interactions or safety alerts for:
    Patient: ${patientData.name}, Age ${patientData.age}
    Prescribed Medicines: ${medicines.join(", ")}
    Known Allergies: ${patientData.allergies || "None"}

    Return ONLY a JSON object:
    {
      "safe": boolean,
      "warnings": ["Warning 1", "Warning 2"] | [],
      "summary": "Brief pharmacist summary"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("ML Error (Pharmacist):", error);
    return null;
  }
}

/**
 * Universal medical image analysis using Groq Vision.
 */
export async function analyzeMedicalImage(imageFile, context = "general medical scan") {
  // Convert image to base64 for Groq
  const base64Image = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(imageFile);
  });

  const prompt = `
    Role: Professional Medical AI Diagnostic System.
    Analyze the provided medical image in the context of: ${context}.
    Detect any abnormalities, disease signs, or injuries.
    If it's a skin condition, provide the top 3 most likely diagnoses with confidence levels.
    If it's a scan (X-ray/MRI), identify specific issues like fractures or lesions.
    
    Return ONLY a JSON object:
    {
      "predictions": [
        {"diagnosis": "Name", "confidence": 0.95, "treatment": "Brief advice"},
        {"diagnosis": "Name", "confidence": 0.85, "treatment": "Brief advice"},
        {"diagnosis": "Name", "confidence": 0.70, "treatment": "Brief advice"}
      ],
      "summary": "Full clinical analysis summary",
      "urgent": boolean
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      model: "llama-3.2-11b-vision-preview",
      response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Vision AI Error:", error);
    return null;
  }
}

/**
 * Interface with the Selenium/BS4 Python backend for live scraping.
 */
export async function getScrapedDiagnosis(query) {
  try {
    const response = await fetch("http://localhost:8000/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error("Scraper offline");
    return await response.json();
  } catch (error) {
    console.error("Scraper Error:", error);
    return { error: "Scraping service is currently unavailable. Please use the AI Model instead." };
  }
}

