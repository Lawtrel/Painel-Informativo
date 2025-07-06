import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 text-lg font-medium">Carregando...</div>
        <div className="text-gray-400 text-sm mt-2">Painel Digital UNEB</div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 