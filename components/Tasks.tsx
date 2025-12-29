import React, { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { apiService } from '../services/api';
import { Plus, RefreshCcw, Search, Trash2, Globe, PlayCircle, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  const loadTasks = async () => {
    setLoading(true);
    const data = await apiService.getTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskUrl) return;
    
    const success = await apiService.createTask(newTaskUrl);
    if (success) {
      setNewTaskUrl('');
      setIsModalOpen(false);
      loadTasks();
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.RUNNING: return 'text-blue-400 border-blue-400/30 bg-blue-400/10 animate-pulse';
      case TaskStatus.COMPLETED: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case TaskStatus.ERROR: return 'text-red-400 border-red-400/30 bg-red-400/10';
      case TaskStatus.WAITING: return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      default: return 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10';
    }
  };

  const translateStatus = (status: TaskStatus) => {
     switch(status) {
        case TaskStatus.RUNNING: return t.status_running;
        case TaskStatus.COMPLETED: return t.status_done;
        case TaskStatus.WAITING: return t.status_queued;
        case TaskStatus.ERROR: return t.status_fail;
        case TaskStatus.STOPPED: return t.status_halt;
        default: return status;
     }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            <span className="text-emerald-500 mr-2">/</span>
            {t.task_manager}
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadTasks}
            className="p-2 text-zinc-400 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black px-4 py-2 text-sm font-bold font-mono transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            <Plus size={16} strokeWidth={3} />
            {t.new_task}
          </button>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 flex-1 flex flex-col relative">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-600"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-600"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-600"></div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.target}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.status}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.progress}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.vuln_count}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">{t.started}</th>
                <th className="p-4 text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-600 font-mono">
                    {t.no_active_tasks}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Globe size={14} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">{task.target}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${getStatusStyle(task.status)}`}>
                        {translateStatus(task.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-1 bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_#10b981]"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-zinc-500 w-8 text-right">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-bold ${task.vulnCount > 0 ? 'text-red-500' : 'text-zinc-600'}`}>{task.vulnCount}</span>
                        {task.vulnCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-zinc-500 font-mono">
                      {new Date(task.startTime).toLocaleString(t === t ? 'zh-CN' : 'en-US')}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-zinc-600 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal - Cyber Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-emerald-500/30 w-full max-w-md shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Terminal size={18} className="text-emerald-500" />
                {t.initiate_scan}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-6 bg-black/50">
              <div>
                <label className="block text-xs font-mono text-emerald-500 mb-2 uppercase tracking-widest">> {t.target_url}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-1 bg-zinc-700 group-focus-within:bg-emerald-500 transition-colors"></div>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newTaskUrl}
                    onChange={(e) => setNewTaskUrl(e.target.value)}
                    className="w-full bg-zinc-900/50 border-0 pl-4 pr-4 py-3 text-white font-mono text-sm placeholder-zinc-700 focus:ring-0 focus:outline-none focus:bg-zinc-900"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold font-mono tracking-wider transition-all"
                >
                  {t.execute}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;