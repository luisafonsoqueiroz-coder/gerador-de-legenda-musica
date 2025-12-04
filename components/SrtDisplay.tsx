
import React, { useState } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

interface SrtDisplayProps {
  srtContent: string;
  fileName: string;
}

export const SrtDisplay: React.FC<SrtDisplayProps> = ({ srtContent, fileName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(srtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([srtContent], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center text-indigo-300">3. Sua Legenda está Pronta</h2>
      <div className="relative bg-gray-900 rounded-lg border border-gray-700">
        <div className="absolute top-2 right-2 flex space-x-2">
          <button onClick={handleCopy} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors" title="Copiar para área de transferência">
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
          </button>
          <button onClick={handleDownload} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors" title="Baixar arquivo .srt">
            <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
        <pre className="p-4 pt-12 text-sm text-left overflow-x-auto max-h-96 rounded-lg font-mono">
          <code>{srtContent}</code>
        </pre>
      </div>
    </div>
  );
};
