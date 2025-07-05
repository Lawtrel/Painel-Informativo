import { useNavigate } from 'react-router-dom';

function SessionExpiredModal() {
  const navigate = useNavigate();

  const handleRelogin = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <i className="fas fa-exclamation-triangle h-8 w-8 text-red-600"></i>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Sessão Expirada
          </h3>
          
          <p className="text-gray-600 mb-6">
            Sua sessão expirou por inatividade. Por favor, faça login novamente para continuar.
          </p>
          
          <button
            onClick={handleRelogin}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200">
            Fazer Login Novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionExpiredModal; 