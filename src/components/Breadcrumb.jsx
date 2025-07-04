export default function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-[#003366] text-sm mb-4">
      <span><i className="fas fa-home"></i></span>
      <span className="font-semibold hover:underline cursor-pointer">Painel de Controle</span>
      <span className="text-gray-400">/</span>
      <span className="font-semibold">Gestão de Conteúdo</span>
    </div>
  );
} 