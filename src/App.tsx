/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Brain, 
  Info, 
  Settings, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Lightbulb,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

// --- Types ---

interface DataPoint {
  attempt: number;
  probability: number;
  result: 'correct' | 'incorrect' | 'none';
}

interface BKTParams {
  pL0: number; // Initial Knowledge
  pT: number;  // Transition (Learning)
  pG: number;  // Guess
  pS: number;  // Slip
}

// --- Components ---

const ParameterSlider = ({ 
  label, 
  value, 
  onChange, 
  description,
  min = 0,
  max = 1,
  step = 0.01 
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  description: string;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {label}
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {description}
          </div>
        </div>
      </label>
      <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

export default function App() {
  // State
  const [params, setParams] = useState<BKTParams>({
    pL0: 0.3,
    pT: 0.1,
    pG: 0.2,
    pS: 0.1
  });

  const [history, setHistory] = useState<DataPoint[]>([]);
  const [currentPL, setCurrentPL] = useState(params.pL0);
  const [activeTab, setActiveTab] = useState<'learn' | 'simulator' | 'quiz'>('learn');

  // Reset simulator
  const resetSimulator = () => {
    setHistory([{ attempt: 0, probability: params.pL0, result: 'none' }]);
    setCurrentPL(params.pL0);
  };

  useEffect(() => {
    resetSimulator();
  }, [params.pL0]);

  const handleAttempt = (isCorrect: boolean) => {
    let pL_given_obs: number;
    const { pS, pG, pT } = params;
    if (isCorrect) {
      pL_given_obs = (currentPL * (1 - pS)) / (currentPL * (1 - pS) + (1 - currentPL) * pG);
    } else {
      pL_given_obs = (currentPL * pS) / (currentPL * pS + (1 - currentPL) * (1 - pG));
    }
    const newPL = pL_given_obs + (1 - pL_given_obs) * pT;
    const nextAttempt = history.length;
    setCurrentPL(newPL);
    setHistory([
      ...history,
      { attempt: nextAttempt, probability: newPL, result: isCorrect ? 'correct' : 'incorrect' }
    ]);
  };

  const progressPercent = activeTab === 'learn' ? 33 : activeTab === 'simulator' ? 66 : 100;

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Knowledge Tracing Interactive Masterclass</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wider">Modo: Interactivo</span>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 px-3">Contenido de Clase</div>
          
          <button 
            onClick={() => setActiveTab('learn')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'learn' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            1. ¿Qué es Knowledge Tracing?
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'simulator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            2. Simulador BKT (Bayesian)
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quiz' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            3. Evaluación y Retos
          </button>
          
          <div className="mt-auto p-4 bg-slate-900 rounded-xl text-white">
            <p className="text-[10px] opacity-70 mb-2 font-mono uppercase tracking-wider">Progreso de Clase</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-indigo-400 h-full" 
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xl font-bold font-mono">{progressPercent}%</p>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl space-y-8"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">Concepto: El estado oculto del saber</h2>
                  <p className="text-slate-600 leading-relax text-lg italic mb-8 border-l-4 border-indigo-200 pl-6 py-2">
                    "Knowledge Tracing es la tarea de modelar el conocimiento de un estudiante a lo largo del tiempo para predecir si responderá correctamente a la próxima interacción."
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex items-center gap-4 transition-colors hover:border-indigo-300">
                      <div className="p-3 bg-blue-100 rounded-lg text-blue-600 font-bold italic shrink-0">P(L)</div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Conocimiento Latente</div>
                        <div className="text-xs text-slate-500 leading-snug">Probabilidad de que el alumno ya sepa el tema antes de interactuar.</div>
                      </div>
                    </div>
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex items-center gap-4 transition-colors hover:border-orange-300">
                      <div className="p-3 bg-orange-100 rounded-lg text-orange-600 font-bold italic shrink-0">P(T)</div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Probabilidad de Transición</div>
                        <div className="text-xs text-slate-500 leading-snug">Oportunidades de aprendizaje real por cada ejercicio realizado.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">BKT (Clásico)</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Divide el aprendizaje en 4 parámetros clave. Es el estándar en ITS (Intelligent Tutoring Systems) por su explicabilidad.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('simulator')} className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                      Simular BKT
                    </button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between border-b-4 border-b-indigo-500">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">DKT (Moderno)</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Utiliza Redes Neuronales Profundas (LSTM) para detectar patrones que el BKT ignora. No requiere parámetros predefinidos.
                      </p>
                    </div>
                    <div className="mt-6 text-xs font-mono text-indigo-600 bg-indigo-50 p-2 rounded text-center">IA AVANZADA</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[500px] flex flex-col">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Visualizador de Probabilidad</h3>
                        <p className="text-xs text-slate-400 mt-1">Densidad de conocimiento según intentos acumulados</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-tight">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Actual
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-tight">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Proyección
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-0 chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="attempt" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                          <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${(v * 100)}%`} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'P(L)']} />
                          <Line type="monotone" dataKey="probability" stroke="#4f46e5" strokeWidth={3} dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (payload.result === 'none') return null;
                            return <circle cx={cx} cy={cy} r={5} fill={payload.result === 'correct' ? '#10b981' : '#ef4444'} stroke="white" strokeWidth={2} />;
                          }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Estado del Sistema</h4>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-mono font-bold text-slate-800">{(currentPL * 100).toFixed(1)}%</div>
                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">ESTADO: {currentPL > 0.95 ? 'MAESTRÍA' : 'APRENDIZAJE'}</div>
                      </div>
                    </div>
                    <div className="bg-indigo-600 rounded-2xl p-6 shadow-sm text-white">
                      <p className="text-[10px] font-bold uppercase text-indigo-200 mb-1 tracking-widest">Total Intentos</p>
                      <div className="text-3xl font-mono font-bold">{history.length}</div>
                    </div>
                  </div>
                </div>

                {/* Instrument Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-8 tracking-widest">Instrumento: Simulador BKT</h3>
                  
                  <div className="space-y-8 flex-1">
                    <ParameterSlider 
                      label="Prob. Adivinar (pG)" 
                      value={params.pG} 
                      onChange={(v) => setParams({...params, pG: v})} 
                      description="Probabilidad de éxito sin saber el tema."
                    />
                    <ParameterSlider 
                      label="Prob. Desliz (pS)" 
                      value={params.pS} 
                      onChange={(v) => setParams({...params, pS: v})} 
                      description="Probabilidad de error sabiendo el tema."
                    />
                    <ParameterSlider 
                      label="Init Know (L0)" 
                      value={params.pL0} 
                      onChange={(v) => setParams({...params, pL0: v})} 
                      description="Base de conocimiento previa."
                    />
                    <ParameterSlider 
                      label="Learning (pT)" 
                      value={params.pT} 
                      onChange={(v) => setParams({...params, pT: v})} 
                      description="Factor de aprendizaje por intento."
                    />
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleAttempt(true)}
                        className="py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                      >
                        Cierto
                      </button>
                      <button 
                        onClick={() => handleAttempt(false)}
                        className="py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors uppercase tracking-widest shadow-lg shadow-rose-500/10"
                      >
                        Error
                      </button>
                    </div>
                    <button 
                      onClick={resetSimulator}
                      className="w-full py-2 bg-slate-800 text-slate-400 rounded-lg text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors"
                    >
                      Reiniciar Data
                    </button>
                    <p className="text-[9px] text-slate-600 text-center uppercase font-mono">Cálculo: Bayes P(Ln | Feedback)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6">Autoevaluación</h3>
                  <div className="space-y-6">
                    <QuizItem 
                      q="¿Por qué la probabilidad no llega a 1.0 inmediatamente tras un acierto?"
                      a="Debido al parámetro Guess (pG). El sistema sospecha que hubo azar."
                    />
                    <QuizItem 
                      q="¿Qué parámetro domina si el alumno falla constantemente?"
                      a="El Slip (pS) y el Learning rate (pT) determinarán qué tan rápido se rinde el modelo."
                    />
                  </div>
                </div>
                
                <div className="bg-indigo-600 rounded-2xl p-8 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold mb-2">¿Dominas el KT?</h4>
                    <p className="text-indigo-100 text-sm">Has completado la visualización de los conceptos básicos.</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-indigo-400 opacity-50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-12 shrink-0 bg-white border-t border-slate-200 px-6 flex items-center text-[10px] text-slate-400 justify-between font-mono">
        <div>ID SESIÓN: KT-APPLET-{new Date().toISOString().split('T')[0]}</div>
        <div className="flex gap-6 uppercase tracking-wider">
          <span className="text-indigo-600 font-bold flex items-center gap-1.5 underline underline-offset-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> 
            Live Logic Check
          </span>
          <span>ESTADO: ONLINE</span>
          <span>LATENCIA: 8ms</span>
        </div>
      </footer>
    </div>
  );
}

const QuizItem = ({ q, a }: { q: string, a: string }) => (
  <div className="group border border-slate-100 p-4 rounded-xl hover:bg-slate-50 transition-colors">
    <h4 className="font-bold text-slate-800 text-sm mb-1">{q}</h4>
    <p className="text-slate-500 text-xs italic">{a}</p>
  </div>
);
