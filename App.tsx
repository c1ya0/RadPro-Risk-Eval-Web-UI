

import React, { useState, useEffect, useRef } from 'react';
import { PatientData, TreatmentType, Gender, AnalysisResult, ViewState, RadarData, EproRecord, ChatMessage } from './types';
import { INITIAL_PATIENT_DATA, COMORBIDITY_OPTIONS, GENOMIC_OPTIONS, MOCK_DASHBOARD_STATS, MOCK_HISTORY_DATA, hydrateHistoryItem } from './constants';
import { evaluatePatientRisk, createMedicalChatSession } from './services';
import { Chat, GenerateContentResponse } from "@google/genai";

// --- Icons ---
const Icons = {
  RadShieldLogo: () => (
    <svg className="w-8 h-8 text-medical-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V13C3 18.5228 7.47715 23 12 23C16.5228 23 21 18.5228 21 13V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="translate(12, 13)">
          <circle r="1.5" fill="currentColor"/>
          <path d="M0 -2.2 L -2 -5.5 A 6 6 0 0 1 2 -5.5 L 0 -2.2 Z" fill="currentColor" />
          <path d="M0 -2.2 L -2 -5.5 A 6 6 0 0 1 2 -5.5 L 0 -2.2 Z" fill="currentColor" transform="rotate(120)" />
          <path d="M0 -2.2 L -2 -5.5 A 6 6 0 0 1 2 -5.5 L 0 -2.2 Z" fill="currentColor" transform="rotate(240)" />
      </g>
    </svg>
  ),
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Assessment: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Activity: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  History: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Dna: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 12 13.536 12 13.536 14 11.536 14 11.536 12 9.257 14.257A6 6 0 1115 7z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  ChartPie: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  ChartBar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
  Document: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Radar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zm8-10a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V6zM17 16a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Clipboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Send: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

// --- Shared Styles ---
const inputClass = "w-full p-2.5 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:bg-white focus:border-medical-500 outline-none transition-colors";

// --- Components ---

const SidebarItem = React.forwardRef<HTMLButtonElement, { icon: any, label: string, active: boolean, onClick: () => void }>(
  ({ icon: Icon, label, active, onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 z-10 ${
        active 
          ? 'text-medical-900' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-medical-600'
      }`}
    >
      <Icon />
      <span className="font-medium">{label}</span>
    </button>
  )
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Hello Dr. Smith. I am your RadShield Assistant. How can I help you with your patients today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createMedicalChatSession();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullResponse = "";
      const botMsgId = (Date.now() + 1).toString();
      
      // Add initial placeholder for streaming
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I apologize, but I'm having trouble connecting to the service right now.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-medical-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Icons.Sparkles />
              <span className="font-bold">Gemini Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <Icons.X />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-medical-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Gemini..."
                className="w-full pl-4 pr-10 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-medical-500 rounded-xl text-sm focus:ring-0 transition-all"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1 text-medical-600 hover:text-medical-800 disabled:opacity-30"
              >
                <Icons.Send />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-gray-700 text-white' : 'bg-medical-600 text-white'
        }`}
      >
        {isOpen ? <Icons.X /> : <Icons.Sparkles />}
      </button>
    </div>
  );
};

// --- Visualizations ---

const GaugeMeter = ({ score, title, subtitle }: { score: number, title: string, subtitle: string }) => {
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    // Determine color
    let color = "text-green-500";
    if (score > 40) color = "text-yellow-500";
    if (score > 70) color = "text-orange-500";
    if (score > 85) color = "text-red-600";

    return (
        <div className="flex flex-col items-center">
             <h4 className={`text-xl font-bold mb-1 ${color}`}>{title}</h4>
             <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
             <div className="relative w-48 h-24 overflow-hidden">
                <svg className="w-48 h-48 transform -rotate-180 origin-center" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeDasharray="141.37 283" strokeDashoffset="0" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                        strokeDasharray="141.37 283"
                        strokeDashoffset={(1 - normalizedScore/100) * 141.37}
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute top-1/2 left-0 w-full text-center mt-2">
                     <span className={`text-4xl font-bold ${color}`}>{Math.round(score)}%</span>
                </div>
             </div>
             <div className="flex justify-between w-48 text-xs text-gray-400 mt-2 px-2">
                 <span>0</span>
                 <span>100</span>
             </div>
        </div>
    )
}

const RadarChart = ({ data }: { data: RadarData }) => {
  // 5 Axes: Genomics, Dosimetry, Age, Meds, Comorbidities
  const axes = [
    { label: "Genomics", key: 'genomics' },
    { label: "Dosimetry", key: 'dosimetry' },
    { label: "Age", key: 'age' },
    { label: "Meds", key: 'meds' },
    { label: "Comorbidities", key: 'comorbidities' }
  ];

  // Up-scaled layout for better visibility
  const scale = 160; 
  const width = 600; // Increased width to prevent clipping
  const cx = 300;    // Adjusted center based on new width
  const cy = 225;
  const height = 450;
  
  const getPoint = (value: number, index: number, total: number, radiusScale = 1) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * scale * radiusScale;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const points = axes.map((axis, i) => getPoint(data[axis.key as keyof RadarData] || 0, i, axes.length)).join(' ');
  
  return (
    <div className="w-full flex justify-center items-center py-4">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible w-full h-auto max-w-[600px]">
        {/* Grid Levels */}
        {[25, 50, 75, 100].map(level => (
           <polygon 
             key={level}
             points={axes.map((_, i) => getPoint(level, i, axes.length)).join(' ')}
             fill="none"
             stroke="#e2e8f0"
             strokeWidth="1"
             strokeDasharray={level === 100 ? "0" : "4 4"}
           />
        ))}

        {/* Axes Lines */}
        {axes.map((_, i) => {
            const [x, y] = getPoint(100, i, axes.length);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />
        })}

        {/* Data Area */}
        <polygon points={points} fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" strokeWidth="3" />
        
        {/* Data Points & Labels */}
        {axes.map((axis, i) => {
            const [x, y] = getPoint(data[axis.key as keyof RadarData] || 0, i, axes.length);
            const [lx, ly] = getPoint(100, i, axes.length, 1.25); // Increased label spacing
            
            // Dynamic text anchor based on position relative to center
            let anchor: "middle" | "end" | "start" = "middle";
            if (lx < cx - 10) anchor = "end";
            if (lx > cx + 10) anchor = "start";

            return (
                <g key={i}>
                    <circle cx={x} cy={y} r="6" className="text-medical-600 fill-white stroke-2 stroke-current" />
                    <text 
                        x={lx} 
                        y={ly} 
                        textAnchor={anchor} 
                        alignmentBaseline="middle" 
                        className="text-sm font-bold fill-gray-700"
                    >
                        {axis.label}
                    </text>
                </g>
            )
        })}
      </svg>
    </div>
  )
}

const BellCurve = ({ percentile }: { percentile: number }) => {
    // Simple Gaussian curve approximation path
    // Range x: 0 to 600. Peak at 300.
    return (
        <div className="relative py-8">
            {/* Legend positioned outside SVG to prevent overlap */}
            <div className="flex justify-center gap-6 mb-6">
                <div className="flex items-center text-xs font-bold text-gray-700">
                    <span className="w-8 h-[2px] bg-blue-500 mr-2 border-b border-dashed border-blue-500"></span>
                    Line: Population
                </div>
                <div className="flex items-center text-xs font-bold text-gray-700">
                     <span className="w-3 h-3 rounded-full bg-medical-900 mr-2"></span>
                     Dot: Current Patient
                </div>
            </div>

            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="bellGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Curve */}
                <path 
                    d="M0,200 C100,200 150,20 300,20 C450,20 500,200 600,200 Z" 
                    fill="url(#bellGradient)" 
                    stroke="#3b82f6" 
                    strokeWidth="2"
                />
                
                {/* Patient Line */}
                <line 
                    x1={percentile * 6} 
                    y1={20} 
                    x2={percentile * 6} 
                    y2={200} 
                    stroke="#1e3a8a" 
                    strokeWidth="2" 
                    strokeDasharray="5 5"
                />
                <circle cx={percentile * 6} cy={200 - (180 * Math.exp(-Math.pow((percentile * 6 - 300)/150, 2)))} r="8" className="fill-medical-900 stroke-white stroke-2" />
            </svg>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>0 (Low Risk)</span>
                <span>Risk Score Distribution</span>
                <span>100 (High Risk)</span>
            </div>
             <div className="text-center mt-4">
                 <p className="text-lg font-bold text-medical-900">Patient is in the {Math.round(percentile)}th Percentile</p>
                 <p className="text-sm text-gray-500">Higher than {Math.round(percentile)}% of the reference population.</p>
             </div>
        </div>
    )
}

// --- Main Views ---

const EproView = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [bleeding, setBleeding] = useState<'none' | 'mild' | 'severe'>('none');
  const [pain, setPain] = useState<number>(0);
  const [urgency, setUrgency] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState<EproRecord[]>([
      { id: 'REC-001', date: '2025-11-14', bleeding: 'none', pain: 2, urgency: 1, frequency: 1 },
      { id: 'REC-002', date: '2025-11-10', bleeding: 'mild', pain: 4, urgency: 3, frequency: 2 }
  ]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { id: 'report', label: 'Symptom Report', icon: '📝' },
    { id: 'history', label: 'History Trends', icon: '📊' }
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const el = tabsRef.current[activeIndex];
    if (el) {
        setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth
        });
    }
  }, [activeTab]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    const newRecord: EproRecord = {
        id: `REC-${Date.now().toString().slice(-3)}`,
        date: new Date().toISOString().split('T')[0],
        bleeding,
        pain,
        urgency,
        frequency
    };
    setHistory([newRecord, ...history]);
    setTimeout(() => {
        setIsSubmitted(false);
        setActiveTab('history');
    }, 1500);
  };

  const getBleedingLabel = (type: string) => {
      switch(type) {
          case 'none': return 'None';
          case 'mild': return 'Mild';
          case 'severe': return 'Severe';
          default: return '';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Tabs */}
      <div className="relative flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit shadow-sm">
        {/* Animated Glider */}
        <div 
           className="absolute top-1 bottom-1 bg-blue-600 rounded-md transition-all duration-300 ease-out shadow-sm"
           style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        ></div>

        {tabs.map((tab, index) => (
            <button
               key={tab.id}
               ref={el => { tabsRef.current[index] = el; }}
               onClick={() => setActiveTab(tab.id as any)}
               className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 
                   ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <span>{tab.icon} {tab.label}</span>
            </button>
        ))}
      </div>

      {activeTab === 'report' && (
        <div className="space-y-6">

          {/* Section 1: Bleeding Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">🩸</div>
                    <div>
                        <span className="font-bold text-gray-800 text-lg block">Rectal Bleeding Status</span>
                    </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-3 gap-4">
                 {['none', 'mild', 'severe'].map((option) => (
                     <button
                        key={option}
                        onClick={() => setBleeding(option as any)}
                        className={`py-4 px-2 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2
                            ${bleeding === option 
                                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                     >
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${bleeding === option ? 'border-red-500' : 'border-gray-300'}`}>
                             {bleeding === option && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                         </div>
                         <span className="font-medium text-sm">{getBleedingLabel(option)}</span>
                     </button>
                 ))}
             </div>
          </div>

          {/* Section 2: Sliders (Pain & Urgency) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pain */}
              <div>
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">😣</div>
                        <div>
                            <span className="font-bold text-gray-800 text-lg block">Pain Index</span>
                            <span className="text-xs text-gray-400">Pain Level (0-10)</span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-yellow-500">{pain}</span>
                  </div>
                  <div className="px-2">
                     <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={pain} 
                        onChange={(e) => setPain(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none focus:ring-0"
                     />
                     <div className="flex justify-between text-xs text-gray-400 mt-2">
                         <span>No Pain</span>
                         <span>Max Pain</span>
                     </div>
                  </div>
              </div>

              {/* Urgency */}
              <div>
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">⚡</div>
                        <div>
                            <span className="font-bold text-gray-800 text-lg block">Urgency</span>
                            <span className="text-xs text-gray-400">Urgency Level (0-10)</span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-500">{urgency}</span>
                  </div>
                  <div className="px-2">
                     <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={urgency} 
                        onChange={(e) => setUrgency(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-0"
                     />
                     <div className="flex justify-between text-xs text-gray-400 mt-2">
                         <span>Normal</span>
                         <span>Severe</span>
                     </div>
                  </div>
              </div>
          </div>

          {/* Section 3: Frequency */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">🚽</div>
                    <div>
                        <span className="font-bold text-gray-800 text-lg block">Stool Frequency</span>
                        <span className="text-xs text-gray-400">Daily Count</span>
                    </div>
                  </div>
              </div>
              
              <div className="flex items-center justify-center space-x-8">
                   <button 
                      onClick={() => setFrequency(Math.max(0, frequency - 1))}
                      className="w-16 h-16 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl font-bold text-3xl transition-colors shadow-sm"
                   >-</button>
                   <div className="w-24 text-center">
                       <span className="text-5xl font-bold text-gray-800">{frequency}</span>
                       <span className="block text-xs text-gray-400 mt-1">times/day</span>
                   </div>
                   <button 
                      onClick={() => setFrequency(frequency + 1)}
                      className="w-16 h-16 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl font-bold text-3xl transition-colors shadow-sm"
                   >+</button>
              </div>
          </div>

          <button 
             onClick={handleSubmit}
             className={`w-full font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-lg
                ${isSubmitted ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
             {isSubmitted ? (
                 <>
                   <Icons.Check /> <span>Report Saved!</span>
                 </>
             ) : (
                 <>
                   <Icons.Upload /> <span>Submit Report</span>
                 </>
             )}
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
             {history.length === 0 ? (
                 <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                     <div className="text-4xl mb-4 text-gray-300">📊</div>
                     <p className="text-gray-500">No history records found. Please submit a report first.</p>
                 </div>
             ) : (
                 history.map((record) => (
                     <div key={record.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
                         <div className="flex items-center space-x-4 mb-4 md:mb-0">
                             <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-mono text-sm font-bold">
                                 {record.date}
                             </div>
                             <div>
                                 <p className="font-bold text-gray-800">Summary</p>
                                 <p className="text-xs text-gray-500">ID: {record.id}</p>
                             </div>
                         </div>
                         
                         <div className="flex items-center space-x-6 text-sm">
                             <div className="text-center">
                                 <span className="block text-gray-400 text-xs">Bleeding</span>
                                 <span className={`font-bold ${record.bleeding === 'none' ? 'text-green-600' : 'text-red-600'}`}>
                                     {getBleedingLabel(record.bleeding)}
                                 </span>
                             </div>
                             <div className="text-center">
                                 <span className="block text-gray-400 text-xs">Pain</span>
                                 <span className="font-bold text-gray-800">{record.pain}/10</span>
                             </div>
                             <div className="text-center">
                                 <span className="block text-gray-400 text-xs">Urgency</span>
                                 <span className="font-bold text-gray-800">{record.urgency}/10</span>
                             </div>
                              <div className="text-center">
                                 <span className="block text-gray-400 text-xs">Freq</span>
                                 <span className="font-bold text-gray-800">{record.frequency}</span>
                             </div>
                         </div>
                     </div>
                 ))
             )}
        </div>
      )}
    </div>
  );
};

const DashboardView = ({ 
  onNewAssessment, 
  onViewAllHistory,
  onViewHistoryItem 
}: { 
  onNewAssessment: () => void, 
  onViewAllHistory: () => void,
  onViewHistoryItem: (item: any) => void
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">Monthly Assessments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{MOCK_DASHBOARD_STATS.monthlyAssessments}</p>
            <p className="text-xs text-green-500 mt-2 font-medium">↑ 12% vs last month</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-medical-600"><Icons.Assessment /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">Avg Risk Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{MOCK_DASHBOARD_STATS.avgRiskScore}</p>
            <p className="text-xs text-gray-500 mt-2">Stable</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Icons.Activity /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase">Critical Alerts</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{MOCK_DASHBOARD_STATS.criticalCases}</p>
            <p className="text-xs text-red-400 mt-2 font-medium">Action Required</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600"><Icons.Alert /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Department Risk Distribution</h3>
          <div className="space-y-4">
            {MOCK_DASHBOARD_STATS.riskDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label} Risk</span>
                  <span className="text-gray-500">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Critical Cases</h3>
            <button onClick={onViewAllHistory} className="text-xs text-medical-600 font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-auto space-y-3">
             {MOCK_HISTORY_DATA.filter(p => p.level === 'Critical' || p.level === 'High').slice(0, 4).map((p, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                 <div>
                   <p className="text-sm font-bold text-gray-800">{p.id}</p>
                   <p className="text-xs text-gray-500">{p.treatment} • {p.date}</p>
                 </div>
                 <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full font-bold">{p.level}</span>
                    <button 
                        onClick={() => onViewHistoryItem(p)}
                        className="p-1 hover:bg-red-200 rounded text-red-700"
                    >
                        <Icons.Dashboard />
                    </button>
                 </div>
               </div>
             ))}
          </div>
          <button 
            onClick={onNewAssessment}
            className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
          >
            Start New Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryView = ({ onViewItem }: { onViewItem: (item: any) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = MOCK_HISTORY_DATA.filter(row => 
    row.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    row.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Assessment History</h3>
          <div className="relative">
             <input 
                type="text" 
                placeholder="Search Patient ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-medical-500" 
             />
             <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Patient ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Age</th>
                <th className="px-6 py-4 font-medium">Treatment</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{row.date}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{row.age}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{row.treatment}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">{row.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold 
                      ${row.level === 'Critical' ? 'bg-red-100 text-red-800' : 
                        row.level === 'High' ? 'bg-orange-100 text-orange-800' : 
                        row.level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {row.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => onViewItem(row)}
                        className="text-medical-600 hover:text-medical-800 text-sm font-medium hover:underline"
                    >
                        View
                    </button>
                  </td>
                </tr>
              )) : (
                  <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No records found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
          Showing {filteredData.length} records. Connect database for full history.
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (val: boolean) => void }) => {
    const [emailNotifs, setEmailNotifs] = useState(true);

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">General Settings</h3>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Dark Mode</h4>
                            <p className="text-sm text-gray-500">Enable dark theme for the interface.</p>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${darkMode ? 'bg-medical-600' : 'bg-gray-200'}`}
                        >
                            <span className={`translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive alerts for high-risk assessments.</p>
                        </div>
                        <button 
                          onClick={() => setEmailNotifs(!emailNotifs)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${emailNotifs ? 'bg-medical-600' : 'bg-gray-200'}`}
                        >
                            <span className={`translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${emailNotifs ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">System Integration</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                        <input type="password" value="************************" disabled className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500" />
                        <p className="text-xs text-gray-400 mt-1">Managed via Environment Variables</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">EMR Connection Status</label>
                        <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Connected (Mock Mode)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AssessmentView = ({ 
  data, 
  setData, 
  onAnalyze, 
  isAnalyzing 
}: { 
  data: PatientData, 
  setData: (d: PatientData) => void, 
  onAnalyze: () => void,
  isAnalyzing: boolean
}) => {
  const handleChange = (field: keyof PatientData, value: any) => {
    setData({ ...data, [field]: value });
  };

  const toggleArrayItem = (field: 'comorbidities' | 'genomicMarkers', item: string) => {
    const current = data[field];
    if (current.includes(item)) {
      handleChange(field, current.filter(i => i !== item));
    } else {
      handleChange(field, [...current, item]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">New Risk Assessment</h2>
        <button 
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 bg-medical-600 text-white px-6 py-2.5 rounded-lg hover:bg-medical-900 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Icons.Activity />
              <span>Run AI Evaluation</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Demographics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Patient Demographics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input 
                type="text" 
                value={data.id} 
                onChange={(e) => handleChange('id', e.target.value)} 
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input 
                  type="number" 
                  value={data.age} 
                  onChange={(e) => handleChange('age', Number(e.target.value))} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={data.gender} 
                  onChange={(e) => handleChange('gender', e.target.value)} 
                  className={inputClass}
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Treatment Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type</label>
              <select 
                value={data.treatmentType} 
                onChange={(e) => handleChange('treatmentType', e.target.value)} 
                className={inputClass}
              >
                {Object.values(TreatmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Dose (Gy)</label>
                <input 
                  type="number" 
                  value={data.totalDoseGy} 
                  onChange={(e) => handleChange('totalDoseGy', Number(e.target.value))} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fractions</label>
                <input 
                  type="number" 
                  value={data.fractions} 
                  onChange={(e) => handleChange('fractions', Number(e.target.value))} 
                  className={inputClass} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Clinical Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Comorbidities */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">Comorbidities</label>
               <div className="space-y-2">
                 {COMORBIDITY_OPTIONS.map(opt => (
                   <label key={opt} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition">
                     <input 
                      type="checkbox" 
                      checked={data.comorbidities.includes(opt)}
                      onChange={() => toggleArrayItem('comorbidities', opt)}
                      className="w-4 h-4 text-medical-600 rounded focus:ring-medical-500 border-gray-300 bg-gray-50"
                     />
                     <span className="text-sm text-gray-700">{opt}</span>
                   </label>
                 ))}
               </div>
            </div>

            {/* Genomic Markers */}
            <div className="border-l border-gray-100 pl-6">
               <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                 <Icons.Dna />
                 <span className="ml-2">Genomic Markers</span>
               </label>
               <div className="space-y-2">
                 {GENOMIC_OPTIONS.map(opt => (
                   <label key={opt} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition">
                     <input 
                      type="checkbox" 
                      checked={data.genomicMarkers.includes(opt)}
                      onChange={() => toggleArrayItem('genomicMarkers', opt)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 bg-gray-50"
                     />
                     <span className="text-sm text-gray-700">{opt}</span>
                   </label>
                 ))}
               </div>
            </div>
          </div>
            
          {/* Notes Full Width */}
          <div className="w-full border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes & Observations</label>
            <textarea 
              value={data.clinicalNotes}
              onChange={(e) => handleChange('clinicalNotes', e.target.value)}
              rows={8}
              className={inputClass}
              placeholder="Enter patient history, complaints, or other relevant clinical data..."
            />
          </div>

        </div>
      </div>
    </div>
  );
};

const ResultView = ({ 
    result, 
    patientId, 
    onBack, 
    readOnly = false 
}: { 
    result: AnalysisResult, 
    patientId: string, 
    onBack: () => void, 
    readOnly?: boolean 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'population' | 'analysis' | 'report'>('dashboard');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { id: 'dashboard', label: 'Risk Dashboard', icon: Icons.ChartBar },
    { id: 'population', label: 'Population Study', icon: Icons.ChartPie },
    { id: 'analysis', label: 'Analysis Detail', icon: Icons.Radar },
    { id: 'report', label: 'Decision Report', icon: Icons.Document },
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const el = tabsRef.current[activeIndex];
    if (el) {
        setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth
        });
    }
  }, [activeTab]);

  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Patient: 陳大明 (Chen, Da-Ming)</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">ID: {patientId} | Date of Birth: 1956/05/15</p>
          </div>
          <button onClick={onBack} className="text-medical-600 hover:text-medical-900 font-medium text-sm">
             ← Back to List
          </button>
      </div>

      {/* Tabs Navigation */}
      <div className="relative flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit shadow-sm">
         {/* Animated Glider */}
         <div 
            className="absolute top-1 bottom-1 bg-medical-600 rounded-md transition-all duration-300 ease-out shadow-sm"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
         ></div>

         {tabs.map((tab, index) => (
             <button
                key={tab.id}
                ref={el => { tabsRef.current[index] = el; }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative z-10 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
             >
                 <tab.icon />
                 <span>{tab.label}</span>
             </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
        {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-around items-center gap-8 py-8">
                    <GaugeMeter score={result.acuteRiskScore} title="Acute Toxicity" subtitle="Expected 0-3 months post-Tx" />
                    <GaugeMeter score={result.chronicRiskScore} title="Late Toxicity" subtitle="Expected > 6 months post-Tx" />
                </div>
                
                <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-yellow-500 mr-2">💡</span>
                        Clinical Decision Support (CDS)
                    </h3>
                    <div className={`p-4 rounded-lg border-l-4 ${result.riskLevel === 'Low' ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                         <p className={`font-bold text-lg ${result.riskLevel === 'Low' ? 'text-green-800' : 'text-yellow-800'}`}>
                             {result.riskLevel === 'Low' 
                                ? '✓ Low Risk: Recommend standard monitoring protocol.' 
                                : `⚠ ${result.riskLevel} Risk: Enhanced surveillance recommended.`}
                         </p>
                         <ul className="mt-2 list-disc list-inside text-gray-700 text-sm">
                            {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                         </ul>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'population' && (
            <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Population Risk Positioning</h3>
                <p className="text-gray-500 text-sm mb-8">Comparison against department database (n=1,200 radiation proctitis cases).</p>
                <BellCurve percentile={result.populationPercentile} />
                
                <div className="grid grid-cols-3 gap-8 mt-12 text-center">
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-bold">Model Confidence</p>
                         <p className="text-3xl font-bold text-medical-600">87.4%</p>
                     </div>
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-bold">Population Size</p>
                         <p className="text-3xl font-bold text-medical-900">1,200</p>
                     </div>
                     <div>
                         <p className="text-gray-500 text-xs uppercase font-bold">Patient Position</p>
                         <p className="text-3xl font-bold text-medical-900">{(result.populationPercentile / 10).toFixed(1)}</p>
                     </div>
                </div>
            </div>
        )}

        {activeTab === 'analysis' && (
            <div className="animate-fade-in">
                 {/* Replaced Blue Header with Text */}
                 <div className="mb-8 border-b border-gray-100 pb-4">
                     <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                         <Icons.Radar /> 
                         <span className="ml-3">Risk Radar Analysis</span>
                     </h3>
                     <p className="text-gray-500 mt-2 text-base ml-8">
                         Multi-dimensional evaluation visualizing the contribution of distinct risk factors to the overall prognosis.
                     </p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                     {/* Chart Section - Takes up 2 columns on large screens for size */}
                     <div className="lg:col-span-2 flex justify-center bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                         <RadarChart data={result.radarData} />
                     </div>
                     
                     {/* Info Section */}
                     <div className="space-y-6">
                         <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                             <h4 className="font-bold text-gray-900 text-lg flex items-center mb-4">
                                 <span className="w-1 h-6 bg-yellow-500 rounded mr-3"></span>
                                 Key Risk Drivers
                             </h4>
                             <ul className="space-y-4">
                                 {Object.entries(result.radarData)
                                    .map(([key, val]) => (
                                     <li key={key} className="flex flex-col">
                                         <div className="flex justify-between items-end mb-1">
                                            <span className="capitalize text-gray-600 font-medium text-sm">{key}</span>
                                            <span className="font-bold text-gray-900">{Math.round(val)}%</span>
                                         </div>
                                         <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className={`h-1.5 rounded-full ${val > 50 ? 'bg-orange-500' : 'bg-blue-400'}`} 
                                                style={{ width: `${val}%` }}
                                            ></div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>

                         <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-start space-x-4">
                             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                 <Icons.Check />
                             </div>
                             <div>
                                 <h4 className="font-bold text-green-800 text-lg">No Contraindications</h4>
                                 <p className="text-sm text-green-700 mt-1 leading-relaxed">
                                    Patient is currently eligible for standard radiation therapy protocols without modification.
                                 </p>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        )}

        {activeTab === 'report' && (
            <div className="animate-fade-in">
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Clinical Report Preview</h3>
                 <p className="text-sm text-gray-500 mb-6">Generated automated report for EMR integration.</p>

                 <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
{`# RadShield AI - Patient Risk Report
**Patient:** 陳大明 (Chen, Da-Ming) (${patientId})
**Date:** ${new Date().toISOString().split('T')[0]}

## Risk Assessment
- **Acute Toxicity Risk:** ${result.acuteRiskScore > 50 ? 'High' : 'Low'} (Score: ${result.acuteRiskScore})
- **Late Toxicity Risk:** ${result.chronicRiskScore > 50 ? 'High' : 'Low'} (Score: ${result.chronicRiskScore})

## Identified Risk Drivers
${result.factors.length > 0 ? result.factors.map(f => `- ${f.name}: ${f.severity}`).join('\n') : '- No significant drivers'}

## Optimization Recommendations
${result.recommendations.map(r => `- ${r}`).join('\n')}

---
*Generated by RadShield AI Prototype*`}
                 </div>
                 
                 <div className="mt-8">
                     <h4 className="font-bold text-gray-800 mb-4">Download</h4>
                     <button className="bg-medical-600 text-white px-6 py-2 rounded-lg hover:bg-medical-700 transition shadow-sm font-medium">
                         Generate PDF Report
                     </button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- App Container ---

function App() {
  const [view, setView] = useState<ViewState>('dashboard'); 
  const [patientData, setPatientData] = useState<PatientData>(INITIAL_PATIENT_DATA);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isReadOnlyResult, setIsReadOnlyResult] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarGlider, setSidebarGlider] = useState({ top: 0, height: 0, opacity: 0 });
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});

  const SIDEBAR_NAV_ITEMS = [
    { id: 'dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
    { id: 'assessment', icon: Icons.Assessment, label: 'Risk Assessment' },
    { id: 'history', icon: Icons.History, label: 'History' },
    { id: 'epro', icon: Icons.Clipboard, label: 'ePRO System' }
  ];

  useEffect(() => {
    const activeItem = SIDEBAR_NAV_ITEMS.find(item => item.id === view);
    if (activeItem && sidebarRefs.current[activeItem.id]) {
        const el = sidebarRefs.current[activeItem.id];
        if (el) {
            setSidebarGlider({
                top: el.offsetTop,
                height: el.offsetHeight,
                opacity: 1
            });
        }
    }
  }, [view]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await evaluatePatientRisk(patientData);
      setAnalysisResult(result);
      setShowResult(true);
      setIsReadOnlyResult(false);
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewHistoryItem = (item: any) => {
    // Now returns a complete result object with radar/acute/chronic data
    const fullResult = hydrateHistoryItem(item);
    setAnalysisResult(fullResult);
    setPatientData({
        ...INITIAL_PATIENT_DATA,
        id: item.id,
        age: item.age,
        treatmentType: item.treatment as any 
    });
    setShowResult(true);
    setIsReadOnlyResult(true);
    setView('history'); 
  };

  const handleBackFromResults = () => {
      setShowResult(false);
      setIsReadOnlyResult(false);
  };

  const renderMainContent = () => {
    if (showResult && analysisResult) {
        return <ResultView result={analysisResult} patientId={patientData.id} onBack={handleBackFromResults} readOnly={isReadOnlyResult} />;
    }

    switch(view) {
        case 'dashboard':
            return <DashboardView 
                onNewAssessment={() => { setView('assessment'); setShowResult(false); }} 
                onViewAllHistory={() => setView('history')}
                onViewHistoryItem={handleViewHistoryItem}
            />;
        case 'history':
            return <HistoryView onViewItem={handleViewHistoryItem} />;
        case 'assessment':
            return <AssessmentView 
              data={patientData} 
              setData={setPatientData} 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
            />;
        case 'settings':
            return <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />;
        case 'epro':
            return <EproView />;
        default:
            return <DashboardView 
                onNewAssessment={() => setView('assessment')} 
                onViewAllHistory={() => setView('history')}
                onViewHistoryItem={handleViewHistoryItem}
            />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Icons.RadShieldLogo />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">RadShield</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto relative">
            {/* Animated Glider */}
            <div 
                className="absolute left-4 right-4 bg-medical-100 border-r-4 border-medical-600 rounded-lg transition-all duration-300 ease-out pointer-events-none z-0"
                style={{ 
                    top: sidebarGlider.top, 
                    height: sidebarGlider.height, 
                    opacity: sidebarGlider.opacity 
                }}
            ></div>

            {SIDEBAR_NAV_ITEMS.map((item) => (
                <SidebarItem 
                    key={item.id}
                    ref={el => { sidebarRefs.current[item.id] = el; }}
                    icon={item.icon} 
                    label={item.label} 
                    active={view === item.id} 
                    onClick={() => { setView(item.id as any); setShowResult(false); }} 
                />
            ))}
        </nav>

        {/* User Profile / Menu */}
        <div className="p-4 border-t border-gray-100 relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
              DR
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">Dr. Smith</p>
              <p className="text-xs text-gray-400">Oncologist</p>
            </div>
            <div className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
               <Icons.ChevronUp />
            </div>
          </button>

          {/* Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in-up origin-bottom">
                <button 
                    onClick={() => { alert('Switch User functionality would open auth dialog.'); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-600 flex items-center space-x-2"
                >
                    <Icons.User /> <span>Switch User</span>
                </button>
                <button 
                    onClick={() => { setDarkMode(!darkMode); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-600 flex items-center space-x-2"
                >
                    <Icons.Moon /> <span>Appearance</span>
                </button>
                 <button 
                    onClick={() => { setView('settings'); setShowResult(false); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-600 flex items-center space-x-2"
                >
                    <Icons.Settings /> <span>Settings</span>
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button 
                    onClick={() => { alert('Logged out successfully.'); window.location.reload(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                    <Icons.Logout /> <span>Log Out</span>
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {showResult 
                ? 'Analysis Results' 
                : view === 'assessment' 
                    ? 'Patient Assessment' 
                    : view === 'dashboard' 
                        ? 'Department Dashboard' 
                        : view === 'history'
                            ? 'Patient History'
                            : view === 'epro'
                                ? 'ePRO System'
                                : 'Settings'}
            </h1>
            <p className="text-gray-500 mt-1">
              {showResult 
                ? `Detailed analysis for ${patientData.id || 'Selected Patient'}` 
                : view === 'dashboard' 
                  ? 'Overview of recent radiation risk evaluations.'
                  : view === 'history'
                    ? 'Archive of past patient evaluations.'
                    : view === 'epro'
                        ? 'Patient Reported Outcomes collection interface.'
                        : view === 'settings'
                            ? 'Configure application preferences.'
                            : 'Manage and evaluate radiation proctitis risks.'}
            </p>
          </div>
          <div className="text-sm text-gray-400">v2.1.0 • React • Gemini AI</div>
        </header>

        <main>
            {renderMainContent()}
        </main>
      </div>

      {/* Global Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
