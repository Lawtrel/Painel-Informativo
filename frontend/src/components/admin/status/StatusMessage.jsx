import React from 'react';

export default function StatusMessage({ fileStatus }) {
  if (!fileStatus.message) return null;
  return (
    <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 shadow-sm border ${fileStatus.type === 'error' ? 'bg-red-100 text-red-700 border-red-200' : fileStatus.type === 'success' ? 'bg-green-100 text-green-700 border-green-200' : fileStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-blue-100 text-[#003366] border-[#003366]/20'}`}>
      <i className={`fas ${fileStatus.type === 'error' ? 'fa-times-circle' : fileStatus.type === 'success' ? 'fa-check-circle' : fileStatus.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
      {fileStatus.message}
    </div>
  );
} 