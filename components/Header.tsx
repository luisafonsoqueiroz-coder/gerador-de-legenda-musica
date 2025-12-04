
import React from 'react';
import { MusicNoteIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-block bg-indigo-500/20 p-4 rounded-full mb-4">
        <MusicNoteIcon className="w-12 h-12 text-indigo-400" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        Gerador de Legendas de Música
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
        Faça o upload de um arquivo de música e nossa IA irá transcrever e sincronizar as letras, criando um arquivo de legenda <span className="font-mono bg-gray-700 px-2 py-1 rounded">.srt</span> para você.
      </p>
    </header>
  );
};
