import logo from '../assets/uneb-seeklogo.png'
export default function Header() {
  
  return (
    <header className="bg-[#003366] text-white py-5 shadow-md">
      <div className="container mx-8 flex items-center">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo UNEB" className="h-28 w-auto" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Gestão do Painel Digital</h1>
            <p className="text-ml opacity-80">Universidade do Estado da Bahia - UNEB</p>
          </div>
        </div>
      </div>
    </header>
  );
} 