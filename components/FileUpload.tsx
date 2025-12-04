
import React, { useState, useCallback } from 'react';
import { UploadIcon, MusicFileIcon } from './icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      alert("Por favor, selecione um arquivo de áudio válido (ex: mp3, wav, ogg).");
      setFileName(null);
      onFileChange(null);
    }
  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    setFileName(null);
    onFileChange(null);
    const input = document.getElementById('audio-upload') as HTMLInputElement;
    if (input) input.value = '';
  }

  const baseClasses = "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300";
  const idleClasses = "border-gray-600 bg-gray-800 hover:bg-gray-700";
  const draggingClasses = "border-indigo-500 bg-indigo-900/50";
  const disabledClasses = "bg-gray-700 border-gray-600 cursor-not-allowed opacity-50";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center text-indigo-300">1. Escolha sua música</h2>
      {!fileName ? (
        <label
          htmlFor="audio-upload"
          className={`${baseClasses} ${disabled ? disabledClasses : isDragging ? draggingClasses : idleClasses}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400"/>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-indigo-400">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">MP3, WAV, OGG, FLAC (Max. 50MB)</p>
          </div>
          <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={handleInputChange} disabled={disabled} />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <MusicFileIcon className="w-8 h-8 text-indigo-400 flex-shrink-0" />
            <span className="font-medium text-gray-300 truncate">{fileName}</span>
          </div>
          <button
            onClick={handleRemoveFile}
            disabled={disabled}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-500 disabled:bg-gray-500"
          >
            Remover
          </button>
        </div>
      )}
    </div>
  );
};
