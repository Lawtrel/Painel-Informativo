import React from 'react';

export default function FilePreview({ selectedFile, imagePreviewUrl, tipo, fileResolution, onRemoveFile, getResolutionBadge }) {
  return (
    <div className="mt-4">
      <div className="bg-gradient-to-r from-[#003366]/5 to-[#003366]/10 rounded-xl p-6 border border-[#003366]/20">
        <div className="flex items-start gap-6">
          <div className="file-preview flex-shrink-0">
            {imagePreviewUrl ? (
              <div className="relative group">
                {tipo === 'imagem' ? (
                  <img 
                    src={imagePreviewUrl} 
                    alt={selectedFile.name}
                    className="w-40 h-40 object-cover rounded-xl border-2 border-[#003366]/20 shadow-lg"
                  />
                ) : (
                  <video
                    src={imagePreviewUrl}
                    className="w-40 h-40 object-cover rounded-xl border-2 border-[#003366]/20 shadow-lg"
                    controls
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button 
                    type="button" 
                    className="text-white hover:text-red-300 transition-colors"
                    onClick={onRemoveFile}
                  >
                    <i className="fas fa-trash text-xl"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-40 h-40 flex items-center justify-center bg-gradient-to-br from-[#003366]/10 to-[#003366]/20 rounded-xl border-2 border-[#003366]/20 shadow-lg">
                  <i className={`fas ${tipo === 'imagem' ? 'fa-image' : 'fa-video'} text-4xl text-[#003366]/60`} />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button 
                    type="button" 
                    className="text-white hover:text-red-300 transition-colors"
                    onClick={onRemoveFile}
                  >
                    <i className="fas fa-trash text-xl"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="file-details flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-lg font-bold text-[#003366] truncate">{selectedFile.name}</h4>
              {fileResolution && getResolutionBadge(fileResolution)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-weight-hanging text-[#003366]"></i>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              {fileResolution && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-expand-arrows-alt text-[#003366]"></i>
                  <span>{fileResolution.width} × {fileResolution.height}</span>
                  <span className="text-gray-400">({fileResolution.aspectRatio}:1)</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-file-alt text-[#003366]"></i>
                <span className="capitalize">{selectedFile.type.split('/')[1]}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                type="button" 
                className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                onClick={onRemoveFile}
              >
                <i className="fas fa-times"></i>
                Remover arquivo
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr className="mt-4 border-t border-[#003366]/10" />
    </div>
  );
} 