import MonitorItem from './MonitorItem';
import { MONITORES } from '../../../../constants/monitors';

export default function MonitorCard({ monitor, onPreviewClick }) {
  const itemCount = monitor.itens?.length || 0;
  
  const monitorInfo = MONITORES.find(m => parseInt(m.value) === monitor.id_monitor);
  const monitorLabel = monitorInfo ? monitorInfo.label : `Monitor ${monitor.id_monitor + 1}`;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg min-w-[360px] max-w-sm flex flex-col border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      {/* Header do Monitor */}
      <div className="w-full bg-gradient-to-r from-[#003366] to-[#004080] text-white px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-tv text-white text-sm"></i>
            </div>
            <span className="font-bold text-xl">{monitorLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90 bg-white/10 px-3 py-1 rounded-lg">
              {itemCount} {itemCount !== 1 ? 'itens' : 'item'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Conteúdo do Monitor */}
      <div className="flex flex-col w-full p-6">
        {!monitor.itens || monitor.itens.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-inbox text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-500 text-sm">Nenhum conteúdo adicionado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {monitor.itens.map((item, idx) => (
              <MonitorItem
                key={item.id || `${item.arquivo || ''}-${item.mensagem || ''}-${idx}`}
                item={item}
                onPreviewClick={onPreviewClick}
                isLast={idx === monitor.itens.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 