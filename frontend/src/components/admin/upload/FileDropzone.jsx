import React from 'react';
import { VALID_IMAGE_TYPES, VALID_VIDEO_TYPES } from '../../../hooks/useFileManager';

export default function FileDropzone({ tipo, onFileChange, onFileDrop, onDragOver, onDragLeave, onClick, isDragOver }) {
  const acceptTypes = tipo === 'imagem' ? VALID_IMAGE_TYPES.join(',') : VALID_VIDEO_TYPES.join(',');
  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-[#003366] hover:bg-[#003366]/5 ${
        isDragOver 
          ? 'border-[#003366] bg-[#003366]/10 scale-105' 
          : 'border-gray-300 bg-gray-50'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onFileDrop}
      onClick={onClick}
    >
      <input 
        id="file-input"
        type="file" 
        className="hidden" 
        accept={acceptTypes} 
        onChange={onFileChange} 
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
          isDragOver ? 'bg-[#003366] text-white' : 'bg-[#003366]/10 text-[#003366]'
        }`}>
          <i className={`fas ${tipo === 'imagem' ? 'fa-image' : 'fa-video'} text-2xl`}></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isDragOver ? 'Solte o arquivo aqui' : 'Clique ou arraste o arquivo'}
          </h3>
          <p className="text-gray-500 text-sm">
            {tipo === 'imagem' 
              ? 'Formatos aceitos: JPG, PNG, GIF' 
              : 'Formatos aceitos: MP4, WEBM, MOV'
            }
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Otimizado para painéis Full HD verticais (1080x1920)
          </p>
        </div>
      </div>
    </div>
  );
} 