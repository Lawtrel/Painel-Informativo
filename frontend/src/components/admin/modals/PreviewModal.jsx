import { useEffect, useState } from 'react';

export default function PreviewModal({ isOpen, onClose, item }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (item && isOpen && item.file) {
      // Criar URL para preview do arquivo real
      const url = URL.createObjectURL(item.file);
      setPreviewUrl(url);
      // Limpar URL quando componente desmontar
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (item && isOpen && item.url_http) {
      setPreviewUrl(item.url_http);
    } else {
      setPreviewUrl(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {item.tipo === 'imagem' ? <i className="fas fa-image text-blue-500" /> : <i className="fas fa-video text-red-500" />}
              Visualização: {item.arquivo}
            </h3>
            <div className="text-sm text-gray-500 mt-1">
              {item.duracao_s}s • {formatFileSize(item.file_size)} • {formatDate(item.data_criacao)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            title="Fechar"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2">Informações do Arquivo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {item.arquivo}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {item.tipo === 'imagem' ? 'Imagem' : 'Vídeo'}
              </div>
              <div>
                <span className="font-medium">Duração:</span> {item.duracao_s} segundos
              </div>
              <div>
                <span className="font-medium">Tamanho:</span> {formatFileSize(item.file_size)}
              </div>
              <div>
                <span className="font-medium">Formato:</span> {item.file_type}
              </div>
              <div>
                <span className="font-medium">Data:</span> {formatDate(item.data_criacao)}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
            {previewUrl ? (
              item.tipo === 'imagem' ? (
                <img 
                  src={previewUrl} 
                  alt={item.arquivo}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video 
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                  muted
                >
                  Seu navegador não suporta vídeos.
                </video>
              )
            ) : (
              <div className="text-center text-white">
                <i className={`fas ${item.tipo === 'imagem' ? 'fa-image' : 'fa-video'} text-6xl mb-4 opacity-50`}></i>
                <p className="text-lg">Carregando preview...</p>
                <p className="text-sm opacity-75 mt-2">Duração: {item.duracao_s} segundos</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Recomendações para Painéis Digitais</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Resolução ideal: 1080x1920px (Full HD Vertical)</li>
              <li>• Proporção: 9:16 (vertical)</li>
                              <li>• Tamanho máximo: 2MB</li>
              <li>• Formatos: JPG, PNG, MP4</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 