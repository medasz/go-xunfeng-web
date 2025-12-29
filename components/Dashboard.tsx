import React, { useEffect, useState } from 'react';
import { SystemStats } from '../types';
import { apiService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AlertTriangle, CheckCircle, Radio, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    apiService.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-emerald-500 font-mono animate-pulse">{t.init_metrics}</div>;

  const severityData = [
    { name: t.high, value: stats.highVulns },
    { name: t.medium, value: stats.mediumVulns },
    { name: t.low, value: stats.lowVulns },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, borderColor }: any) => (
    <div className={`relative bg-zinc-900/40 backdrop-blur-md p-6 border ${borderColor} overflow-hidden group hover:bg-zinc-900/60 transition-colors`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${colorClass} opacity-5 rounded-full group-hover:scale-125 transition-transform duration-500`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest">{title}</h3>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-4xl font-mono font-bold text-white relative z-10">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            <span className="text-emerald-500 mr-2">/</span>
            {t.security_overview}
        </h2>
        <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            {t.live_feed}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t.total_vulns} value={stats.totalVulns} icon={ShieldAlert} colorClass="bg-red-500" borderColor="border-red-500/20" />
        <StatCard title={t.critical} value={stats.highVulns} icon={AlertTriangle} colorClass="bg-orange-500" borderColor="border-orange-500/20" />
        <StatCard title={t.active_tasks} value={stats.runningTasks} icon={Radio} colorClass="bg-emerald-500" borderColor="border-emerald-500/20" />
        <StatCard title={t.completed} value={stats.totalTasks - stats.runningTasks} icon={CheckCircle} colorClass="bg-blue-500" borderColor="border-blue-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
        {/* Severity Chart */}
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 border border-zinc-800 flex flex-col relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500"></div>

          <h3 className="text-sm font-mono text-zinc-400 mb-6 uppercase tracking-wider">{t.vuln_dist}</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {severityData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs font-mono text-zinc-400">{entry.name} <span className="text-white ml-1">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 border border-zinc-800 flex flex-col relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500"></div>

          <h3 className="text-sm font-mono text-zinc-400 mb-6 uppercase tracking-wider">{t.detect_velocity}</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'MON', vulns: 4 },
                  { name: 'TUE', vulns: 7 },
                  { name: 'WED', vulns: 2 },
                  { name: 'THU', vulns: 12 },
                  { name: 'FRI', vulns: 8 },
                  { name: 'SAT', vulns: 5 },
                  { name: 'SUN', vulns: 3 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} axisLine={false} />
                <YAxis stroke="#52525b" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: '#27272a', opacity: 0.4 }}
                   contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                />
                <Bar dataKey="vulns" fill="#10b981" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;