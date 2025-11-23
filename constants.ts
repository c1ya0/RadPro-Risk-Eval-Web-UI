import { Gender, TreatmentType, PatientData, AnalysisResult } from './types';

export const INITIAL_PATIENT_DATA: PatientData = {
  id: 'PT-2024-001',
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
  "MLH1/MSH2 (Lynch Syndrome)",
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
  { id: 'PT-2024-089', date: '2024-02-14', age: 72, treatment: 'VMAT (Standard)', score: 88, level: 'Critical' },
  { id: 'PT-2024-088', date: '2024-02-14', age: 58, treatment: 'IMRT', score: 45, level: 'Moderate' },
  { id: 'PT-2024-087', date: '2024-02-13', age: 66, treatment: 'VMAT (Standard)', score: 12, level: 'Low' },
  { id: 'PT-2024-086', date: '2024-02-12', age: 70, treatment: 'Proton Therapy', score: 32, level: 'Low' },
  { id: 'PT-2024-085', date: '2024-02-11', age: 62, treatment: 'VMAT (Standard)', score: 75, level: 'High' },
  { id: 'PT-2024-084', date: '2024-02-10', age: 55, treatment: 'VMAT (Standard)', score: 28, level: 'Low' },
  { id: 'PT-2024-083', date: '2024-02-09', age: 69, treatment: 'IMRT', score: 60, level: 'Moderate' },
  { id: 'PT-2024-082', date: '2024-02-08', age: 74, treatment: 'Proton Therapy', score: 92, level: 'Critical' },
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
