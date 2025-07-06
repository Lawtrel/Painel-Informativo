import unebLogo from '../../assets/uneb-seeklogo.png';

function LoginHeader() {
  return (
    <div className="text-center mb-8">
      <div className="mx-auto mb-6">
        <img 
          src={unebLogo} 
          alt="Logo UNEB" 
          className="h-32 w-auto mx-auto drop-shadow-lg"
        />
      </div>
      
      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#003366] to-[#004080] bg-clip-text text-transparent mb-2">
        Painel Informativo
      </h2>
      <p className="text-gray-600 text-sm">
        Faça login para acessar o painel administrativo
      </p>
    </div>
  );
}

export default LoginHeader; 