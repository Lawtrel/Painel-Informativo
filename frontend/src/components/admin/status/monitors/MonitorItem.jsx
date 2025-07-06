import MediaPreview from './MediaPreview';
import StatusBadge from './StatusBadge';

export default function MonitorItem({ item, onPreviewClick, isLast }) {
  return (
    <div>
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <MediaPreview item={item} onPreviewClick={onPreviewClick} />
        
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          {/* Tipo do conteúdo */}
          <span className="text-base font-semibold text-[#003366] mb-2 capitalize truncate">
            {item.tipo.replace('_', ' ')}
          </span>
          
          {/* Nome do arquivo */}
          {item.arquivo && (
            <span className="flex items-center gap-2 text-sm text-gray-600 mb-2 truncate">
              <i className="fas fa-file-image text-gray-400"></i>
              <span className="truncate">{item.arquivo}</span>
            </span>
          )}
          
          {/* Duração */}
          {item.duracao_s !== undefined && (
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium rounded-lg px-3 py-1 mb-2 w-fit border border-blue-200">
              <i className="fas fa-clock mr-1"></i>
              {item.duracao_s}s
            </span>
          )}
          
          {/* Texto simples */}
          {item.mensagem && item.tipo === 'texto_simples' && (
            <span className="text-sm text-gray-500 truncate max-w-[160px] leading-tight">
              {item.mensagem}
            </span>
          )}
          
          {/* Status do upload */}
          <StatusBadge status={item.status} />
        </div>
      </div>
      
      {/* Separador  */}
      {!isLast && (
        <div className="mx-4 my-3">
          <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
      )}
    </div>
  );
} 