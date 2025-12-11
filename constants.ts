
import { Gender, TreatmentType, PatientData, AnalysisResult } from './types';

export const INITIAL_PATIENT_DATA: PatientData = {
  id: 'PT-2025-001',
  age: 65,
  gender: Gender.Male,
  totalDoseGy: 70,
  fractions: 35,
  treatmentType: TreatmentType.VMAT,
  comorbidities: [],
  genomicMarkers: [],
  clinicalNotes: "Patient reports mild rectal bleeding 6 months post-treatment. History of hypertension and diabetes type 2. Complains of urgency."
};

export const COMORBIDITY_OPTIONS = [
  "Diabetes Mellitus",
  "Hypertension",
  "Inflammatory Bowel Disease",
  "Hemorrhoids",
  "Anticoagulant Therapy Use",
  "Smoking History",
  "Prior Abdominal Surgery"
];

export const GENOMIC_OPTIONS = [
  "ATM Mutation",
  "BRCA1/2 Mutation",
  "TGFB1 Polymorphism",
  "XRCC1 Variant",
  "MLH1/MSH2 mutation",
  "TP53 Mutation"
];

export const MOCK_DASHBOARD_STATS = {
  monthlyAssessments: 142,
  criticalCases: 8,
  avgRiskScore: 42,
  riskDistribution: [
    { label: "Low", value: 45, color: "bg-green-500" },
    { label: "Moderate", value: 30, color: "bg-yellow-400" },
    { label: "High", value: 20, color: "bg-orange-500" },
    { label: "Critical", value: 5, color: "bg-red-600" }
  ]
};

export const MOCK_HISTORY_DATA = [
  { id: 'PT-2025-089', date: '2025-11-14', age: 72, treatment: 'VMAT (Standard)', score: 88, level: 'Critical' },
  { id: 'PT-2025-088', date: '2025-11-14', age: 58, treatment: 'IMRT', score: 45, level: 'Moderate' },
  { id: 'PT-2025-087', date: '2025-11-13', age: 66, treatment: 'VMAT (Standard)', score: 12, level: 'Low' },
  { id: 'PT-2025-086', date: '2025-11-12', age: 70, treatment: 'Proton Therapy', score: 32, level: 'Low' },
  { id: 'PT-2025-085', date: '2025-11-11', age: 62, treatment: 'VMAT (Standard)', score: 75, level: 'High' },
  { id: 'PT-2025-084', date: '2025-11-10', age: 55, treatment: 'VMAT (Standard)', score: 28, level: 'Low' },
  { id: 'PT-2025-083', date: '2025-11-09', age: 69, treatment: 'IMRT', score: 60, level: 'Moderate' },
  { id: 'PT-2025-082', date: '2025-11-08', age: 74, treatment: 'Proton Therapy', score: 92, level: 'Critical' },
];

export const EORTC_PRT20_ITEMS = [
  { id: 1, text: "Have you had a bloated feeling in your abdomen?", type: 'likert' },
  { id: 2, text: "Were you troubled by passing wind / gas / flatulence?", type: 'likert' },
  { id: 3, text: "Have you had excessive gurgling noise from your abdomen?", type: 'likert' },
  { id: 4, text: "Have you had any unintentional release (leakage) of wind or mucous?", type: 'likert' },
  { id: 5, text: "Have you had any unintentional release (leakage) of liquid stools?", type: 'likert' },
  { id: 6, text: "Have you needed to get up at night to open your bowels?", type: 'likert' },
  { id: 7, text: "Have you had abdominal pain or cramping not related to a bowel movement?", type: 'likert' },
  { id: 8, text: "Have you had pain or cramping in your rectum (deep inside the back passage)?", type: 'likert' },
  { id: 9, text: "Have you had pain /discomfort around your anal opening (back passage)?", type: 'likert' },
  { id: 10, text: "Have you had bright blood in your stools?", type: 'likert' },
  { id: 11, text: "Have you been unable to wait 15 minutes to open your bowels?", type: 'likert' },
  { id: 12, text: "Have you had the feeling of being unable to completely empty your bowels?", type: 'likert' },
  { id: 13, text: "Does passing water cause your bowels to act immediately?", type: 'likert' },
  { id: 14, text: "Have you had difficulty going out of the house, because you needed to be close to a toilet, because of bowel problems?", type: 'likert' },
  { id: 15, text: "Did your treatment restrict the types of food you can eat due to your bowel problems?", type: 'likert' },
  { id: 16, text: "Did you worry about your bowel problem?", type: 'likert' },
  { id: 17, text: "Did you feel embarrassed by your bowel problem?", type: 'likert' },
  { id: 18, text: "How unhappy would you feel if you lived the rest of your life with your bowel habit as it is now?", type: 'likert' },
  { id: 19, text: "Have you needed to take medication to control diarrhea?", type: 'yesno' },
  { id: 20, text: "What was the highest number of times you had to open your bowels in any 24 hours period? Please indicate number in box?", type: 'number' },
  { id: 21, text: "Would you like more assistance to manage your bowel problem? (optional question)", type: 'yesno' },
];

// Helper to expand simple history items into full mock analysis results
export const hydrateHistoryItem = (item: any): AnalysisResult => {
  const isHighRisk = item.score > 60;
  
  return {
    riskScore: item.score,
    acuteRiskScore: Math.min(100, item.score + (Math.random() * 10 - 5)),
    chronicRiskScore: Math.min(100, Math.max(0, item.score - (Math.random() * 15))),
    riskLevel: item.level,
    populationPercentile: item.score, // Simple mapping for mock
    radarData: {
      genomics: isHighRisk ? 70 + Math.random() * 20 : Math.random() * 30,
      dosimetry: item.treatment.includes('Proton') ? 30 : 60,
      age: (item.age / 100) * 80,
      meds: Math.random() * 50,
      comorbidities: isHighRisk ? 80 : 20
    },
    reasoning: `Historical analysis retrieved for ${item.id}. The patient exhibited signs consistent with ${item.level.toLowerCase()} risk of radiation proctitis following ${item.treatment}.`,
    factors: [
      { name: "Total Dose", description: "> 50Gy Accumulated Dose", severity: item.score > 50 ? "High" : "Medium" },
      { name: "Age Factor", description: `Patient age ${item.age}`, severity: item.age > 70 ? "High" : "Low" }
    ],
    recommendations: [
      "Review past clinical notes for progression.",
      "Schedule follow-up if symptoms persist.",
      "Compare with current genomic markers if available."
    ],
    timestamp: new Date(item.date).getTime()
  };
};
