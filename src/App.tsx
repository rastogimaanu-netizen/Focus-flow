import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, MobileNavigation } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { TimerView } from './components/timer/TimerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { ColorGrindGame } from './components/game/ColorGrindGame';
import { CelebrationModal } from './components/ui/CelebrationModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea/select
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('dashboard');
      } else if (e.key === '2') {
        setActiveTab('tasks');
      } else if (e.key === '3') {
        setActiveTab('timer');
      } else if (e.key === '4') {
        setActiveTab('analytics');
      } else if (e.key === '5') {
        setActiveTab('colorgrind');
      } else if (e.key === '6') {
        setActiveTab('settings');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setActiveTab]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FC] text-slate-900 font-sans">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Main Content */}
        <main
          className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 md:pb-8 pb-20 ${
            activeTab === 'colorgrind' ? 'p-2 sm:p-4' : ''
          }`}
        >
          <div className={`${activeTab === 'colorgrind' ? 'max-w-5xl' : 'max-w-7xl'} mx-auto h-full`}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'timer' && <TimerView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'colorgrind' && <ColorGrindGame />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Celebration Feedback Modal */}
      <CelebrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
