import React, { useEffect, useState } from 'react';
import { LayoutDashboard, List, ShieldAlert, Settings, Terminal, Languages, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService, getBaseUrl } from '../services/api';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { t, language, setLanguage } = useLanguage();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // 定期检查连接状态
  useEffect(() => {
    const checkConnection = async () => {
      // 这里的检测比较轻量，使用 stats 接口
      const isConnected = await apiService.testConnection(getBaseUrl());
      setConnectionStatus(isConnected ? 'online' : 'offline');
    };

    checkConnection();
    // 每 15 秒轮询一次状态
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'tasks', label: t.tasks, icon: List },
    { id: 'vulns', label: t.vulns, icon: ShieldAlert },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col h-full shrink-0 z-20">
      <div className="p-6 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Terminal className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-white tracking-widest font-mono">XUNFENG</h1>
                <div className="text-[10px] text-emerald-500 tracking-widest uppercase">{t.scanner_system}</div>
            </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-sm tracking-wider font-mono transition-all duration-200 border-l-2 group ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Icon size={18} className={isActive ? 'drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'group-hover:text-zinc-300'} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 space-y-4">
        {/* Language Switch */}
        <button 
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-700 rounded-sm hover:border-emerald-500 text-zinc-400 hover:text-emerald-500 transition-all text-xs font-mono"
        >
            <Languages size={14} />
            {language === 'en' ? 'SWITCH TO 中文' : 'SWITCH TO ENGLISH'}
        </button>

        {/* Real Status Indicator */}
        <div className={`p-3 border transition-colors duration-500 bg-black/40 ${
            connectionStatus === 'online' ? 'border-emerald-900/50' : 'border-amber-900/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
             <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.system_status}</p>
             <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-sm ${
                    connectionStatus === 'online' 
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                        : connectionStatus === 'checking' 
                            ? 'bg-blue-500' 
                            : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                }`}></span>
                <span className={`text-[10px] font-bold ${
                    connectionStatus === 'online' 
                        ? 'text-emerald-500' 
                        : connectionStatus === 'checking'
                            ? 'text-blue-500'
                            : 'text-amber-500'
                }`}>
                    {connectionStatus === 'online' ? t.online : connectionStatus === 'checking' ? t.checking : t.offline_mock}
                </span>
             </div>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-sm overflow-hidden">
             <div className={`h-full w-2/3 animate-[pulse_3s_infinite] ${
                 connectionStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
             }`}></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;