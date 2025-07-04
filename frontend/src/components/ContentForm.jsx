import { useState } from 'react';
import { useFileManager } from '../hooks/useFileManager.js';
import PreviewModal from './PreviewModal.jsx';
import FileDropzone from './FileDropzone.jsx';
import FilePreview from './FilePreview.jsx';
import MonitorSelect from './MonitorSelect.jsx';
import FormActions from './FormActions.jsx';
import StatusMessage from './StatusMessage.jsx';

export default function ContentForm({ addItemToPlaylist, loading }) {
  const [tipo, setTipo] = useState('imagem');
  const [duracao, setDuracao] = useState(10);
  const [monitor, setMonitor] = useState('0');
  const [previewItem, setPreviewItem] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const {
    selectedFile,
    fileResolution,
    status: fileStatus,
    processSelectedFile,
    removeSelectedFile,
    setStatus: setFileStatus
  } = useFileManager();

  function handleTipoChange(e) {
    setTipo(e.target.value);
    removeSelectedFile();
    setImagePreviewUrl(null);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file, tipo);
      if ((tipo === 'imagem' && file.type.startsWith('image/')) || (tipo === 'video' && file.type.startsWith('video/'))) {
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      } else {
        setImagePreviewUrl(null);
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processSelectedFile(file, tipo);
      if ((tipo === 'imagem' && file.type.startsWith('image/')) || (tipo === 'video' && file.type.startsWith('video/'))) {
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      } else {
        setImagePreviewUrl(null);
      }
    }
  }

  function handleFileSelect() {
    document.getElementById('file-input').click();
  }

  function handlePreview() {
    if (!selectedFile) {
      setFileStatus({ message: 'Por favor, selecione um arquivo primeiro', type: 'error' });
      return;
    }
    const tempItem = {
      tipo,
      duracao_s: duracao,
      arquivo: selectedFile.name,
      file_size: selectedFile.size,
      file_type: selectedFile.type,
      data_criacao: new Date().toISOString(),
      file: selectedFile
    };
    setPreviewItem(tempItem);
  }

  function handleRemoveFile() {
    removeSelectedFile();
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) {
      setFileStatus({ message: 'Por favor, selecione um arquivo', type: 'error' });
      return;
    }
    if (duracao < 1 || duracao > 3600) {
      setFileStatus({ message: 'A duração deve estar entre 1 e 3600 segundos', type: 'error' });
      return;
    }
    const itemData = {
      tipo,
      duracao_s: duracao,
      monitorId: monitor,
      arquivo: selectedFile.name,
      file_size: selectedFile.size,
      file_type: selectedFile.type,
      file: selectedFile
    };
    await addItemToPlaylist(itemData);
    handleRemoveFile();
    setDuracao(10);
  }

  function getResolutionBadge(resolution) {
    if (!resolution) return null;
    const { width, height } = resolution;
    const aspectRatio = width / height;
    if (width >= 1080 && height >= 1920 && Math.abs(aspectRatio - 0.5625) < 0.1) {
      return <span className="bg-[#003366]/10 text-[#003366] text-xs px-3 py-1 rounded-full font-semibold">Full HD Vertical</span>;
    }
    if (width >= 720 && height >= 1280 && aspectRatio > 0.5) {
      return <span className="bg-[#003366]/10 text-[#003366] text-xs px-3 py-1 rounded-full font-semibold">HD Vertical</span>;
    }
    if (aspectRatio > 1) {
      return <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">Horizontal</span>;
    }
    return <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">Baixa Resolução</span>;
  }

  const isSubmitting = loading;

  return (
    <>
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#003366]"><i className="fas fa-plus-circle"></i> Adicionar Novo Conteúdo</h2>
          <p className="text-gray-600">Gerencie o conteúdo que será exibido nos painéis digitais</p>
        </div>
        <form className="bg-white rounded-lg shadow-md p-6 border border-[#003366]/10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#003366]"><i className="fas fa-file-alt"></i> Tipo de Conteúdo</label>
              <select className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-[#003366] focus:ring-[#003366]" value={tipo} onChange={handleTipoChange}>
                <option value="imagem">Imagem (JPG, PNG, GIF)</option>
                <option value="video">Vídeo (MP4, WEBM, MOV)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#003366]"><i className="fas fa-clock"></i> Duração de Exibição</label>
              <div className="flex items-center gap-2">
                <input type="number" value={duracao} min={1} max={3600} onChange={e => setDuracao(Number(e.target.value))} className="w-24 border border-gray-300 rounded-lg px-2 py-1 focus:border-[#003366] focus:ring-[#003366]" />
                <span className="text-gray-500">segundos</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            {!selectedFile && (
              <FileDropzone
                tipo={tipo}
                onFileChange={handleFileChange}
                onFileDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleFileSelect}
                isDragOver={isDragOver}
              />
            )}
            {selectedFile && (
              <FilePreview
                selectedFile={selectedFile}
                imagePreviewUrl={imagePreviewUrl}
                tipo={tipo}
                fileResolution={fileResolution}
                onRemoveFile={handleRemoveFile}
                getResolutionBadge={getResolutionBadge}
              />
            )}
            <StatusMessage fileStatus={fileStatus} />
          </div>
          <MonitorSelect monitor={monitor} onChange={e => setMonitor(e.target.value)} />
          
          <FormActions
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onPreview={handlePreview}
            selectedFile={selectedFile}
          />
          
        </form>
      </section>
      <PreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        item={previewItem}
      />
    </>
  );
} 