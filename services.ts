import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, AnalysisResult } from "./types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function evaluatePatientRisk(data: PatientData): Promise<AnalysisResult> {
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the following patient data for the risk of Radiation Proctitis (RadPro).
    
    Patient Details:
    - Age: ${data.age}
    - Gender: ${data.gender}
    - Treatment: ${data.treatmentType}
    - Total Dose: ${data.totalDoseGy} Gy in ${data.fractions} fractions
    - Comorbidities: ${data.comorbidities.join(', ') || 'None reported'}
    - Genomic/Genetic Markers: ${data.genomicMarkers.join(', ') || 'None reported'}
    - Clinical Notes: "${data.clinicalNotes}"

    Task:
    1. Calculate an OVERALL risk score (0-100).
    2. Calculate specific scores for ACUTE Toxicity (0-3 months) and CHRONIC Toxicity (>6 months).
    3. Generate normalized values (0-100) for a 5-axis Radar Chart:
       - Genomics (Risk from genetic factors)
       - Dosimetry (Risk from dose/fractionation)
       - Age (Age-related risk)
       - Meds (Risk from concurrent medications/anticoagulants inferred from notes)
       - Comorbidities (Risk from diabetes, IBD, etc.)
    4. Estimate the patient's risk percentile (0-100) compared to a standard population of radiation patients (higher percentile = higher relative risk).
    5. Determine the overall Risk Level.
    6. Provide reasoning and recommendations.
    
    Return the response in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Radiation Oncologist. You provide precise numerical risk assessments for visualization dashboards. Your assessments are conservative. For the radar chart, assume values based on clinical guidelines.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "Overall Risk score 0-100" },
            acuteRiskScore: { type: Type.NUMBER, description: "Acute toxicity risk 0-100" },
            chronicRiskScore: { type: Type.NUMBER, description: "Late toxicity risk 0-100" },
            riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Critical"] },
            populationPercentile: { type: Type.NUMBER, description: "Patient's risk percentile relative to population (0-100)" },
            radarData: {
              type: Type.OBJECT,
              properties: {
                genomics: { type: Type.NUMBER },
                dosimetry: { type: Type.NUMBER },
                age: { type: Type.NUMBER },
                meds: { type: Type.NUMBER },
                comorbidities: { type: Type.NUMBER },
              }
            },
            reasoning: { type: Type.STRING },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as AnalysisResult;
      result.timestamp = Date.now();
      return result;
    } else {
      throw new Error("No response text received from AI.");
    }
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    // Fallback for demo/error purposes
    return {
      riskScore: 0,
      acuteRiskScore: 0,
      chronicRiskScore: 0,
      riskLevel: 'Low',
      populationPercentile: 50,
      radarData: { genomics: 0, dosimetry: 0, age: 0, meds: 0, comorbidities: 0 },
      reasoning: "AI Service unavailable. Please check API Key configuration.",
      factors: [],
      recommendations: ["Consult manual guidelines."],
      timestamp: Date.now()
    };
  }
}
