
import React, { useState, useEffect } from 'react';

interface LyricsEditorProps {
  lyrics: string[];
  setLyrics: React.Dispatch<React.SetStateAction<string[]>>;
  onSync: () => void;
  isLoading: boolean;
  audioFile: File | null;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({ lyrics, setLyrics, onSync, isLoading, audioFile }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyrics(e.target.value.split('\n'));
  };

  const isSyncDisabled = isLoading || lyrics.join('').trim().length === 0;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center text-indigo-300">2. Revise e Edite a Letra</h2>
      
      {audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} className="w-full h-14 rounded-lg bg-gray-700">
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      )}

      <textarea
        value={lyrics.join('\n')}
        onChange={handleLyricsChange}
        disabled={isLoading}
        rows={12}
        className="w-full bg-gray-900 text-gray-300 p-3 rounded-md resize-y border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono leading-relaxed"
        aria-label="Editor de letras"
        placeholder="Edite a letra aqui. Cada linha no texto se tornará uma legenda separada."
      />

       <div className="mt-6 flex justify-end">
        <button
            onClick={onSync}
            disabled={isSyncDisabled}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
            {isLoading ? 'Sincronizando...' : 'Sincronizar e Gerar SRT'}
        </button>
      </div>
    </div>
  );
};
