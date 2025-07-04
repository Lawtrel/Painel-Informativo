import React from 'react';

export default function FormActions({ isSubmitting, onSubmit, onPreview, selectedFile }) {
  return (
    <div className="flex gap-2 mt-6">
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#00509E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSubmit}
      >
        {isSubmitting ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Enviando...
          </>
        ) : (
          <>
            <i className="fas fa-plus"></i>
            Adicionar ao Monitor
          </>
        )}
      </button>
      <button 
        type="button" 
        className="flex items-center gap-2 bg-gray-200 text-[#003366] px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        onClick={onPreview}
        disabled={!selectedFile}
      >
        <i className="fas fa-eye"></i> 
        Visualizar
      </button>
    </div>
  );
} 