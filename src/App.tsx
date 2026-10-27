import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { IoTTelemetryModal } from './components/common/IoTTelemetryModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { SmartBinsPage } from './pages/SmartBinsPage';
import { CollectionRequestsPage } from './pages/CollectionRequestsPage';
import { CollectionRoutesPage } from './pages/CollectionRoutesPage';
import { WorkersFleetPage } from './pages/WorkersFleetPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SmartBin } from './types';
import { canAccessPage } from './utils/rbac';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [initialBinForRequest, setInitialBinForRequest] = useState<SmartBin | null>(null);

  // Guard routing if role cannot access current page
  React.useEffect(() => {
    if (!canAccessPage(currentUser.role, currentPage)) {
      setCurrentPage('overview');
    }
  }, [currentUser.role, currentPage]);

  const handleNavigate = (page: PageId) => {
    if (canAccessPage(currentUser.role, page)) {
      setCurrentPage(page);
    } else {
      setCurrentPage('overview');
    }
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateRequestForBin = (bin: SmartBin) => {
    if (canAccessPage(currentUser.role, 'requests')) {
      setInitialBinForRequest(bin);
      setCurrentPage('requests');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors">
      {/* Desktop & Mobile Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 h-full">
            <Sidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              onOpenTelemetryModal={() => {
                setMobileSidebarOpen(false);
                setIsTelemetryModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && (
            <OverviewPage
              onNavigate={handleNavigate}
              onOpenAddBin={() => setCurrentPage('bins')}
              onOpenCreateRequest={() => setCurrentPage('requests')}
            />
          )}

          {currentPage === 'bins' && (
            <SmartBinsPage
              onOpenCreateRequestForBin={handleOpenCreateRequestForBin}
            />
          )}

          {currentPage === 'requests' && (
            <CollectionRequestsPage
              initialBinForNewRequest={initialBinForRequest}
              onClearInitialBin={() => setInitialBinForRequest(null)}
            />
          )}

          {currentPage === 'routes' && (
            <CollectionRoutesPage />
          )}

          {currentPage === 'fleet' && (
            <WorkersFleetPage />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentPage === 'notifications' && (
            <NotificationsPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Notifications Toast */}
      <ToastContainer />

      {/* Global IoT Sensor Telemetry & ESP32 Hardware Lab Modal */}
      <IoTTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
