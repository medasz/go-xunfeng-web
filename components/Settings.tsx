import React, { useState, useEffect } from 'react';
import { Save, Server, Wifi, WifiOff, RefreshCw, HelpCircle } from 'lucide-react';
import { apiService, getBaseUrl, setBaseUrl } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const { t } = useLanguage();

  useEffect(() => {
    setUrl(getBaseUrl());
  }, []);

  const handleTestConnection = async () => {
    setStatus('checking');
    const isConnected = await apiService.testConnection(url);
    setStatus(isConnected ? 'success' : 'error');
  };

  const handleSave = () => {
    setBaseUrl(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            <span className="text-emerald-500 mr-2">/</span>
            {t.system_config}
        </h2>
        <p className="text-zinc-500 text-xs font-mono mt-1">{t.config_desc}</p>
      </div>

      {/* API Connection Panel */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Server size={100} className="text-emerald-500" />
        </div>

        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
          <span className="w-1 h-4 bg-emerald-500 inline-block"></span>
          {t.conn_settings}
        </h3>
        
        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">{t.api_endpoint}</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    setStatus('idle');
                }}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 bg-black border border-zinc-700 px-4 py-3 text-white placeholder-zinc-700 focus:border-emerald-500 focus:outline-none transition-all font-mono text-sm"
              />
              <button
                onClick={handleTestConnection}
                disabled={status === 'checking'}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center gap-2 font-mono text-xs uppercase"
              >
                {status === 'checking' ? <RefreshCw className="animate-spin" size={16} /> : t.test_ping}
              </button>
            </div>
            {/* Connection Status Indicator */}
            {status !== 'idle' && (
                <div className={`mt-4 p-3 border-l-2 flex items-center gap-3 text-xs font-mono transition-all duration-300 ${
                    status === 'success' 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                        : status === 'error' 
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-blue-500 bg-blue-500/10 text-blue-400'
                }`}>
                    {status === 'success' && <><Wifi size={16} /> {t.conn_established}</>}
                    {status === 'error' && <><WifiOff size={16} /> {t.conn_refused}</>}
                    {status === 'checking' && t.handshake}
                </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Save size={16} />
              {t.save_config}
            </button>
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="bg-zinc-900/20 border border-zinc-800 p-6">
         <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
            <HelpCircle size={16} className="text-zinc-500" />
            {t.conn_guide_title}
         </h3>
         <ul className="space-y-3 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">>></span> 
                {t.conn_step_1}
            </li>
            <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">>></span> 
                {t.conn_step_2}
            </li>
            <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!!</span> 
                {t.conn_step_3}
            </li>
         </ul>
      </div>
      
      <div className="bg-zinc-900/20 border border-zinc-800 border-dashed p-6 grayscale opacity-50">
        <h3 className="text-sm font-bold text-zinc-500 mb-2 font-mono uppercase">{t.advanced_policy}</h3>
        <p className="text-zinc-600 text-xs font-mono">{t.feature_locked}</p>
      </div>
    </div>
  );
};

export default Settings;