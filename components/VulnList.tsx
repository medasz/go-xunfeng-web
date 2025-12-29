import React, { useEffect, useState } from 'react';
import { Vulnerability, Severity } from '../types';
import { apiService } from '../services/api';
import { geminiService } from '../services/geminiService';
import { AlertTriangle, AlertOctagon, Info, Search, Bot, ExternalLink, X, Bug, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FormattedText = ({ text }: { text: string }) => {
    return (
        <div className="prose prose-invert prose-sm max-w-none text-zinc-300 font-mono text-xs leading-relaxed">
            {text.split('\n').map((line, i) => (
                <p key={i} className="mb-2 min-h-[1rem]">{line}</p>
            ))}
        </div>
    );
};

const VulnList: React.FC = () => {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    apiService.getVulns().then((data) => {
      setVulns(data);
      setLoading(false);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedVuln) return;
    setAnalyzing(true);
    setAiAnalysis('');
    const result = await geminiService.analyzeVulnerability(selectedVuln, language);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.HIGH: return <AlertOctagon className="text-red-500" size={16} />;
      case Severity.MEDIUM: return <AlertTriangle className="text-orange-500" size={16} />;
      case Severity.LOW: return <Bug className="text-blue-500" size={16} />;
      default: return <Info className="text-zinc-500" size={16} />;
    }
  };

  const getSeverityStyle = (severity: Severity) => {
     const styles = {
        [Severity.HIGH]: "text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        [Severity.MEDIUM]: "text-orange-400 border-orange-500/50 bg-orange-500/10",
        [Severity.LOW]: "text-blue-400 border-blue-500/50 bg-blue-500/10",
        [Severity.INFO]: "text-zinc-400 border-zinc-500/50 bg-zinc-500/10",
     };
     return `px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${styles[severity]}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
             <span className="text-emerald-500 mr-2">/</span>
             {t.vuln_db}
          </h2>
        </div>
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
                type="text" 
                placeholder={t.search_db}
                className="bg-black/40 border border-zinc-800 rounded-none pl-10 pr-4 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none transition-colors w-64"
            />
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 flex-1 flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>
        
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 w-24">{t.severity}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.vuln_title}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.target}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.plugin}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 text-right">{t.time}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
                {vulns.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-zinc-600 font-mono">{t.no_data}</td></tr>
                ) : (
                vulns.map((vuln) => (
                    <tr 
                        key={vuln.id} 
                        onClick={() => setSelectedVuln(vuln)}
                        className="cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                        <td className="p-4">
                            <span className={getSeverityStyle(vuln.severity)}>{vuln.severity}</span>
                        </td>
                        <td className="p-4 font-mono text-sm text-zinc-300 group-hover:text-emerald-400 transition-colors">
                            {vuln.title}
                        </td>
                        <td className="p-4 text-xs font-mono text-zinc-500 truncate max-w-xs">{vuln.url}</td>
                        <td className="p-4 text-xs font-mono text-zinc-500 uppercase">{vuln.plugin}</td>
                        <td className="p-4 text-xs font-mono text-zinc-600 text-right">{vuln.foundAt.split(' ')[1] || vuln.foundAt}</td>
                    </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal - Cyber Style */}
      {selectedVuln && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-zinc-950 h-full border-l border-zinc-800 shadow-[-20px_0_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div>
                    <div className="flex items-center gap-3 mb-3">
                         <span className={getSeverityStyle(selectedVuln.severity)}>{selectedVuln.severity}</span>
                         <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{t.id}: {selectedVuln.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight font-mono">{selectedVuln.title}</h2>
                    <a href={selectedVuln.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-emerald-500 hover:text-emerald-400 mt-2 flex items-center gap-1 hover:underline">
                        {selectedVuln.url} <ExternalLink size={10} />
                    </a>
                </div>
                <button 
                    onClick={() => { setSelectedVuln(null); setAiAnalysis(''); }}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Details Section */}
                <section>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Cpu size={14} />
                        {t.tech_payload}
                    </h3>
                    <div className="bg-black rounded-sm p-4 border border-zinc-800 font-mono text-xs text-zinc-400 whitespace-pre-wrap break-all shadow-inner">
                        {selectedVuln.detail}
                    </div>
                </section>

                {/* AI Analysis Section */}
                <section className="bg-zinc-900/20 rounded-sm border border-emerald-500/20 overflow-hidden relative">
                    <div className="bg-emerald-950/20 p-3 border-b border-emerald-500/10 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <Bot className="text-emerald-400" size={16} />
                             <h3 className="font-bold text-emerald-100 text-xs font-mono tracking-wider">{t.gemini_assistant}</h3>
                         </div>
                         {!aiAnalysis && !analyzing && (
                             <button 
                                onClick={handleAnalyze}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold font-mono transition-colors flex items-center gap-2"
                             >
                                {t.execute_analysis}
                             </button>
                         )}
                    </div>
                    
                    <div className="p-5 min-h-[120px] font-mono text-xs">
                        {analyzing ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                <div className="w-16 h-1 bg-zinc-800 overflow-hidden rounded-full">
                                    <div className="h-full bg-emerald-500 w-1/2 animate-[translateX_1s_infinite_linear]"></div>
                                </div>
                                <p className="text-emerald-500 animate-pulse">{t.processing}</p>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="text-zinc-300">
                                <FormattedText text={aiAnalysis} />
                            </div>
                        ) : (
                            <div className="text-center py-4 text-zinc-600">
                                {t.awaiting_command}
                            </div>
                        )}
                    </div>
                </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VulnList;