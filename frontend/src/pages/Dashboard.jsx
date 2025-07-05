import Header from '../components/admin/layout/Header.jsx';
import Footer from '../components/admin/layout/Footer.jsx';
import Breadcrumb from '../components/admin/layout/Breadcrumb.jsx';
import MonitorsStatus from '../components/admin/status/MonitorsStatus.jsx';
import ContentForm from '../components/admin/forms/ContentForm.jsx';
import SaveActions from '../components/admin/forms/SaveActions.jsx';
import { usePlaylistManager } from '../hooks/usePlaylistManager.js';

export default function Dashboard() {
  const {
    loading,
    status,
    addItemToPlaylist,
    savePlaylist,
    setStatus,
    hasPendingItems,
    getSortedMonitors,
    resetForm,
    resetTrigger
  } = usePlaylistManager();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 min-h-0">
        <main className="p-6 min-h-0">
          <Breadcrumb />
          
          <MonitorsStatus 
            monitores={getSortedMonitors()}
            loading={loading}
          />
          <ContentForm 
            addItemToPlaylist={addItemToPlaylist}
            loading={loading}
            setStatus={setStatus}
            onReset={resetTrigger}
          />
          <SaveActions 
            savePlaylist={savePlaylist}
            loading={loading}
            status={status}
            hasPendingItems={hasPendingItems()}
            resetForm={resetForm}
          />
          {/* Mensagem de status */}
          <div className="status-message hidden"></div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 