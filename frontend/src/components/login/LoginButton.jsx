function LoginButton({ loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex justify-center cursor-pointer items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#004080] hover:to-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
    >
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin mr-3 text-white"></i>
          Entrando...
        </>
      ) : (
        <>
          <i className="fas fa-sign-in-alt mr-2"></i>
          Entrar
        </>
      )}
    </button>
  );
}

export default LoginButton; 