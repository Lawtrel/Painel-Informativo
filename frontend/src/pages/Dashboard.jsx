import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import MonitorsStatus from '../components/MonitorsStatus.jsx';
import ContentForm from '../components/ContentForm.jsx';
import SaveActions from '../components/SaveActions.jsx';
import { usePlaylistManager } from '../hooks/usePlaylistManager.js';

export default function Dashboard() {
  const playlistManager = usePlaylistManager();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 min-h-0">
        <main className="p-6 min-h-0">
          <Breadcrumb />
          <MonitorsStatus 
            monitores={playlistManager.monitores}
            loading={playlistManager.loading}
          />
          <ContentForm 
            addItemToPlaylist={playlistManager.addItemToPlaylist}
            loading={playlistManager.loading}
            setStatus={playlistManager.setStatus}
          />
          <SaveActions 
            savePlaylist={playlistManager.savePlaylist}
            loading={playlistManager.loading}
            status={playlistManager.status}
          />
          {/* Mensagem de status */}
          <div className="status-message hidden"></div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 