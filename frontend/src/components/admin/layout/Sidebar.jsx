export default function Sidebar() {
  return (
    <aside className="w-80 bg-white shadow-md p-6 hidden md:block h-full">
      <nav>
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#003366] mb-2 tracking-widest">PAINEL DE CONTROLE</h3>
          <ul>
            <li className="bg-[#003366]/10 rounded-lg px-2 py-1">
              <a href="#dashboard" className="flex items-center gap-2 text-[#003366] font-bold hover:bg-[#003366]/20 rounded-lg px-2 py-1 transition-colors">
                <i className="fas fa-tv"></i>
                <span>Gestão de Conteúdo</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
} 