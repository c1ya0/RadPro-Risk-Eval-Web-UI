
export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum TreatmentType {
  VMAT = 'VMAT (Standard)',
  IMRT = 'IMRT',
  Proton = 'Proton Therapy'
}

export interface PatientData {
  id: string;
  age: number;
  gender: Gender;
  totalDoseGy: number;
  fractions: number;
  treatmentType: TreatmentType;
  comorbidities: string[];
  genomicMarkers: string[];
  clinicalNotes: string;
}

export interface RiskFactor {
  name: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface RadarData {
  genomics: number;
  dosimetry: number;
  age: number;
  meds: number;
  comorbidities: number;
}

export interface AnalysisResult {
  riskScore: number; // Overall aggregated score
  acuteRiskScore: number; // 0-3 months
  chronicRiskScore: number; // > 6 months
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  radarData: RadarData;
  populationPercentile: number; // 0-100
  reasoning: string;
  factors: RiskFactor[];
  recommendations: string[];
  timestamp: number;
}

export interface EproRecord {
  id: string;
  date: string;
  bleeding: 'none' | 'mild' | 'severe';
  pain: number;
  urgency: number;
  frequency: number;
}

export type ViewState = 'dashboard' | 'assessment' | 'history' | 'settings' | 'epro';
