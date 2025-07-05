import { useAuth } from '../../hooks/useAuth.js';
import LoginForm from './LoginForm.jsx';
import LoginHeader from './LoginHeader.jsx';
import LoginFooter from './LoginFooter.jsx';
import LoginBackground from './LoginBackground.jsx';

function Login() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (username, password) => {
    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] flex items-center justify-center p-4 relative overflow-hidden">
      <LoginBackground />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <LoginHeader />
          
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