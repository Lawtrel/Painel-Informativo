import SessionTimer from '../status/SessionTimer.jsx';
import { useAuthContext } from '../../../hooks/useAuthContext.js';
import logo from '../../../assets/uneb-seeklogo.png'

export default function Header() {
  const { remainingTime, logout, handleSessionExpire } = useAuthContext();
  
  return (
    <header className="bg-[#003366] text-white py-5 shadow-md">
      <div className="w-full mx-auto px-8 flex items-center">
        <div className="flex items-center gap-4 flex-1">
          <img src={logo} alt="Logo UNEB" className="h-28 w-auto" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Gestão do Painel Digital</h1>
            <p className="text-ml opacity-80">Universidade do Estado da Bahia - UNEB</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {remainingTime && (
            <SessionTimer 
              remainingTime={remainingTime} 
              onExpire={handleSessionExpire}
            />
          )}
          <button
            onClick={logout}
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt w-5 h-5"></i>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
} 