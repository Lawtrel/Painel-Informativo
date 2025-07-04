import Header from '../components/Header';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import MonitorsStatus from '../components/MonitorsStatus';
import ContentForm from '../components/ContentForm';
import SaveActions from '../components/SaveActions';
import { usePlaylistManager } from '../hooks/usePlaylistManager';

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