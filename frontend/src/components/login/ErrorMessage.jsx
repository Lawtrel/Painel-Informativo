function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 animate-pulse">
      <i className="fas fa-exclamation-triangle text-red-500"></i>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default ErrorMessage; 