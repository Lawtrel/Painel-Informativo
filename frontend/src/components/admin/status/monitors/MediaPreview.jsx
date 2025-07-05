export default function MediaPreview({ item, onPreviewClick }) {
  // Função para obter a URL da imagem/vídeo
  function getMediaUrl(item) {
    if (item.url_http) {
      return item.url_http; // URL HTTP da API (itens já salvos)
    }
    if (item.preview_url) {
      return item.preview_url; // Preview local para itens pendentes
    }
    if (item.arquivo) {
      const baseUrl = window.location.origin + '/Painel-Informativo/conteudo_simulado_ftp/';
      return baseUrl + item.arquivo;
    }
    return null;
  }

  const mediaUrl = getMediaUrl(item);
  
  if (item.tipo === 'imagem' && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt={item.arquivo}
        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm hover:shadow-md"
        onClick={() => onPreviewClick(item)}
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
        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
        controls
      />
    );
  }
  
  if (item.tipo === 'texto_simples' && item.mensagem) {
    return (
      <div
        className="w-32 h-32 flex items-center justify-center rounded-lg border-2 border-gray-200 text-xs font-medium text-center p-2 shadow-sm"
        style={{ background: item.cor_fundo || '#222', color: item.cor_texto || '#fff' }}
      >
        {item.mensagem}
      </div>
    );
  }
  
  return (
    <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center shadow-sm">
      <i className={`fas fa-${item.tipo === 'imagem' ? 'image' : item.tipo === 'video' ? 'video' : 'align-left'} text-gray-400 text-2xl`}></i>
    </div>
  );
} 