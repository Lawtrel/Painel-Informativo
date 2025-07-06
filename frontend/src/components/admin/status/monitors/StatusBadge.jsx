export default function StatusBadge({ status }) {
  if (!status) return null;
  
  const statusConfig = {
    'pendente': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      label: 'Pendente',
      icon: 'fa-clock'
    },
    'enviado': { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      label: 'Enviado',
      icon: 'fa-check'
    },
    'erro': { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      label: 'Erro',
      icon: 'fa-exclamation-triangle'
    }
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-block text-xs font-bold rounded-lg px-3 py-1 w-fit ${config.bg} ${config.text} border`}>
      <i className={`fas ${config.icon} mr-1`}></i>
      {config.label}
    </span>
  );
} 