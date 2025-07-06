import { useState } from 'react';
import PreviewModal from '../modals/PreviewModal';
import MonitorCard from './monitors/MonitorCard';
import LoadingState from './monitors/LoadingState';
import EmptyState from './monitors/EmptyState';

export default function MonitorsStatus({ monitores, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const handlePreviewClick = (item) => {
    setModalItem(item);
    setModalOpen(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (monitores.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-[#003366]">
        <div className="w-8 h-8 bg-[#003366] rounded-lg flex items-center justify-center">
          <i className="fas fa-tv text-white text-sm"></i>
        </div>
        Status dos Monitores
      </h2>
      
      <div className="flex gap-6 overflow-x-auto py-4 pb-6">
        {monitores.map(monitor => (
          <MonitorCard
            key={monitor.id_monitor}
            monitor={monitor}
            onPreviewClick={handlePreviewClick}
          />
        ))}
      </div>
      
      {/* Modal de preview */}
      <PreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={modalItem}
      />
    </section>
  );
} 