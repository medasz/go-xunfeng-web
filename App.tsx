import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import VulnList from './components/VulnList';
import Settings from './components/Settings';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'vulns':
        return <VulnList />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 overflow-hidden flex flex-col relative bg-black/50 backdrop-blur-sm">
         {/* Top ambient glow */}
         <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="flex-1 overflow-auto p-6 md:p-8 relative z-10">
            <div className="max-w-8xl mx-auto h-full">
                {renderContent()}
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;