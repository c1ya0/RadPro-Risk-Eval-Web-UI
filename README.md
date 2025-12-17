# RadShield - Radiation Proctitis Risk Evaluation Dashboard

A modern, medical-grade web application designed for Radiation Oncologists to assess, visualize, and monitor the risk of Radiation Proctitis (RadPro) in patients undergoing radiation therapy.

This project upgrades a legacy Streamlit prototype into a full-featured, responsive React application integrated with Google's Gemini 2.5 Flash AI for intelligent clinical decision support.

---

## 📸 Interface Preview

### 1. Department Dashboard
*A high-level overview of department statistics, recent critical cases, and risk distribution.*
![Department Dashboard](docs/images/dashboard_preview.png)

### 2. AI Risk Assessment Form
*Structured clinical intake form integrating demographics, dosimetry, and AI-suggested clinical notes.*
![Risk Assessment Form](docs/images/assessment_form.png)

### 3. Analysis Results & Clinical Decision Support
*Comprehensive risk report featuring risk dashboard, population risk positioning, risk radar analysis, clinical report preview.*
![Analysis Results](docs/images/results_view.png)

### 4. ePRO System (Patient View)
*Web/Mobile-responsive interface for patients to report symptoms (patient reported outcome) and complete standardized questionnaires (QLQ-PRT20).*
![ePRO System](docs/images/epro_system.png)

### 5. Gemini Medical Suggestions
*Integrated chatbot for real-time medical queries and data interpretation (API-key required).*
![Gemini Chat Widget](docs/images/chat_widget.png)

---

## 🌟 Key Features

### 1. **Intelligent Risk Assessment**
*   **AI-Powered Analysis**: Integrates **Google Gemini** to analyze structured data (Dosimetry, Demographics) and unstructured text (Clinical Notes, Genomic Markers).
*   **Dual-Risk Scoring**: Calculates distinct probability scores for **Acute Toxicity** (0-3 months) and **Late Toxicity** (>6 months).
*   **Multi-Dimensional Radar**: Visualizes risk contributions across 5 key axes: Genomics, Dosimetry, Age, Medications, and Comorbidities.

### 2. **Professional Medical UI**
*   **Modern Dashboard**: A clean, "Glassmorphism" inspired interface designed for clinical environments.
*   **Interactive Visualizations**:
    *   **Radial Gauges**: Instant visual feedback on risk levels.
    *   **Population Bell Curve**: Places individual patient risk in the context of a 1,200-patient dataset.
    *   **Animated Radar Charts**: Clear visualization of multi-factorial risk drivers.
*   **Responsive Design**: Built with Tailwind CSS for seamless use on desktops and tablets.

### 3. **ePRO System (Patient Reported Outcomes)**
*   **Integrated Patient Portal**: A dedicated interface for patients to report symptoms directly.
*   **Standardized Questionnaires**: Fully integrated **EORTC QLQ-PRT20** (European Organization for Research and Treatment of Cancer) module for standardized quality-of-life assessment.
*   **Symptom Scoring**: Automatically calculates normalized Symptom Burden Scores (0-100) based on patient responses to the 21-item questionnaire.
*   **General Symptom Tracking**: Tracks Rectal Bleeding status, Pain Index (0-10), Urgency, and Stool Frequency.
*   **Longitudinal History**: Visualizes trends for both general symptoms and standardized QLQ-PRT20 scores to help clinicians identify progression early.

### 4. **Clinical Decision Support (CDS)**
*   **Automated Reasoning**: The AI generates human-readable reasoning for every risk score.
*   **Actionable Recommendations**: Provides tailored clinical next steps (e.g., "Review anticoagulant therapy", "Schedule colonoscopy").
*   **Contraindication Checks**: Automatically flags potential contraindications based on patient history.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Custom "Medical" color palette & Animations)
*   **AI Engine**: Google GenAI SDK (`@google/genai`) connecting to Gemini 2.5 Flash
*   **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)
*   **Icons**: Custom SVG Icons tailored for medical context

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A Google AI Studio API Key (for Gemini integration)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/radshield-web-ui.git
    cd radshield-web-ui
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    *   Create a `.env` file in the root directory.
    *   Add your Gemini API Key:
        ```env
        API_KEY=your_google_ai_studio_api_key_here
        ```
    *   *Note: In the current prototype setup via standard build tools, ensure the key is accessible to the process environment.*

4.  **Run Development Server**
    ```bash
    npm start
    ```
    Open [http://localhost:8080](http://localhost:8080) to view the app.

---

## 📂 Project Structure

*   **`App.tsx`**: Main application logic, routing (Dashboard/Assessment/History/ePRO), and view components.
*   **`services.ts`**: Handles interaction with the Google Gemini API, including prompt engineering and JSON schema validation.
*   **`types.ts`**: TypeScript definitions for Patient Data, Risk Models, and ePRO records.
*   **`constants.ts`**: Mock data for history, dashboard statistics, questionnaires, and configuration options.
*   **`index.html`**: Root HTML file containing Tailwind CSS CDN and font configurations.

---

## 🩺 Clinical Context

Radiation Proctitis is a common side effect of pelvic radiation therapy (e.g., for prostate or cervical cancer). Early identification of high-risk patients allows for:
1.  **Dose Optimization**: Adjusting VMAT/IMRT plans for better sparing.
2.  **Pre-habilitation**: Managing comorbidities (diabetes, hypertension) before treatment.
3.  **Early Intervention**: Initiating symptom management protocols immediately upon report.

**RadShield** bridges the gap between complex dosimetric data and actionable clinical insight.

---

## ⚠️ Disclaimer

This application is a **prototype** for research and demonstration purposes. It is not an FDA-approved medical device. The risk scores and AI recommendations should be verified by a qualified medical professional before making clinical decisions.
