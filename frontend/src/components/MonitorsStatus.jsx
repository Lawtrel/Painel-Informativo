import { useState } from 'react';
import PreviewModal from './PreviewModal';

export default function MonitorsStatus({ monitores, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  // Função para obter a URL da imagem/vídeo
  function getMediaUrl(item) {
    if (item.preview_url) {
      return item.preview_url; // Preview local para itens pendentes
    }
    if (item.url_http) {
      return item.url_http;
    }
    if (item.arquivo) {
      const baseUrl = window.location.origin + '/Painel-Informativo/conteudo_simulado_ftp/';
      return baseUrl + item.arquivo;
    }
    return null;
  }

  // Preview para cada conteúdo
  function getPreview(item) {
    const mediaUrl = getMediaUrl(item);
    
    if (item.tipo === 'imagem' && mediaUrl) {
      return (
        <img
          src={mediaUrl}
          alt={item.arquivo}
          className="w-32 h-32 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            setModalItem(item);
            setModalOpen(true);
          }}
          onError={(e) => {
            // Fallback se a imagem não carregar
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    if (item.tipo === 'video' && mediaUrl) {
      return (
        <video
          src={mediaUrl}
          className="w-32 h-32 object-cover rounded border"
          controls
        />
      );
    }
    if (item.tipo === 'texto_simples' && item.mensagem) {
      return (
        <div
          className="w-32 h-32 flex items-center justify-center rounded border text-xs font-medium text-center"
          style={{ background: item.cor_fundo || '#222', color: item.cor_texto || '#fff' }}
        >
          {item.mensagem}
        </div>
      );
    }
    return (
      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
        <i className={`fas fa-${item.tipo === 'imagem' ? 'image' : item.tipo === 'video' ? 'video' : 'align-left'} text-gray-400`}></i>
      </div>
    );
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#003366]"><i className="fas fa-tv"></i> Status dos Monitores</h2>
      {monitores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[180px]">
          <i className="fas fa-tv text-4xl text-gray-300 mb-2"></i>
          <h3 className="text-lg font-semibold mb-1 text-[#003366]">Nenhum conteúdo adicionado</h3>
          <p className="text-gray-500">Use o formulário abaixo para começar a adicionar conteúdo aos monitores</p>
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto py-6">
          {monitores.map(monitor => (
            <div key={monitor.id_monitor} className="bg-white rounded-2xl shadow-lg min-w-[320px] max-w-sm flex flex-col p-0 border-2 border-[#003366]/10">
              {/* Header */}
              <div className="w-full bg-[#003366] text-white px-6 py-3 rounded-t-2xl shadow-sm flex items-center justify-between">
                <span className="font-bold text-xl">Monitor {monitor.id_monitor + 1}</span>
              </div>
              <div className="flex flex-col w-full p-6">
                {monitor.itens.length === 0 ? (
                  <div className="text-gray-400 text-center">Nenhum conteúdo</div>
                ) : (
                  monitor.itens.map((item, idx) => (
                    <div key={item.id || `${item.arquivo || ''}-${item.mensagem || ''}-${idx}`}>
                      <div className="flex items-center gap-3">
                        {getPreview(item)}
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                          {/* type content text*/}
                          <span className="text-base font-semibold text-[#003366] mb-1 capitalize truncate">{item.tipo.replace('_', ' ')}</span>
                          {/* name arquive */}
                          {item.arquivo && (
                            <span className="flex items-center gap-1 text-xs text-gray-700 mb-1 truncate">
                              <i className="fas fa-file-image text-gray-400"></i>
                              <span className="truncate">{item.arquivo}</span>
                            </span>
                          )}
                          {/* duration */}
                          {item.duracao_s !== undefined && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-medium rounded px-2 py-0.5 mb-1 w-fit border border-gray-200">
                              {item.duracao_s}s
                            </span>
                          )}
                          {/* text simple */}
                          {item.mensagem && item.tipo === 'texto_simples' && (
                            <span className="text-xs text-gray-500 truncate max-w-[140px]">{item.mensagem}</span>
                          )}
                          {/* status do upload */}
                          {item.status && (
                            <span className={`inline-block text-xs font-bold rounded px-2 py-0.5 mb-1 w-fit ml-1
                              ${item.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${item.status === 'enviado' ? 'bg-green-100 text-green-800' : ''}
                              ${item.status === 'erro' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {item.status === 'pendente' && 'Pendente'}
                              {item.status === 'enviado' && 'Enviado'}
                              {item.status === 'erro' && 'Erro'}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* separetor */}
                      {idx < monitor.itens.length - 1 && (
                        <hr className="my-2 border-t border-[#003366]/10" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal de preview */}
      <PreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={modalItem}
      />
    </section>
  );
} 