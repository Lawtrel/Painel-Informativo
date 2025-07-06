import { useAuthContext } from '../hooks/useAuthContext.js';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm.jsx';
import LoginHeader from '../components/login/LoginHeader.jsx';
import LoginFooter from '../components/login/LoginFooter.jsx';
import LoginBackground from '../components/login/LoginBackground.jsx';

function Login() {
  const { login, loading, error } = useAuthContext();
  const location = useLocation();
  const sessionExpiredMessage = location.state?.message;

  const handleSubmit = async (username, password) => {
    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] flex items-center justify-center p-4 relative overflow-hidden">
      <LoginBackground />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <LoginHeader />
          
          {sessionExpiredMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <i className="fas fa-exclamation-triangle"></i>
                <span className="text-sm font-medium">{sessionExpiredMessage}</span>
              </div>
            </div>
          )}
          
          <LoginForm 
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />

          <LoginFooter />
        </div>
      </div>
    </div>
  );
}

export default Login; 