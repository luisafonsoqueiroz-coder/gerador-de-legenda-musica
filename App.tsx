
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SrtDisplay } from './components/SrtDisplay';
import { LyricsEditor } from './components/LyricsEditor';
import { transcribeAudio, synchronizeLyrics } from './services/geminiService';
import { fileToBase64, jsonToSrt } from './utils/fileUtils';
import type { SrtBlock } from './types';

type AppStep = 'IDLE' | 'TRANSCRIBING' | 'EDITING' | 'SYNCING' | 'DONE';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('IDLE');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [srtResult, setSrtResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setAudioFile(file);
    // Reset the process if a new file is uploaded or the current one is removed.
    setStep('IDLE');
    setSrtResult(null);
    setError(null);
    setLyrics([]);
  };
  
  const handleStartOver = () => {
    handleFileChange(null);
    const input = document.getElementById('audio-upload') as HTMLInputElement;
    if (input) input.value = '';
  }

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) {
      setError("Por favor, selecione um arquivo de áudio primeiro.");
      return;
    }

    setStep('TRANSCRIBING');
    setError(null);
    setSrtResult(null);

    try {
      const base64Audio = await fileToBase64(audioFile);
      const transcribedLyrics = await transcribeAudio(audioFile.type, base64Audio);
      
      if (!transcribedLyrics) {
          throw new Error("A IA não conseguiu transcrever a letra.");
      }

      setLyrics(transcribedLyrics);
      setStep('EDITING');

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(`Ocorreu um erro na transcrição: ${err.message}`);
      } else {
        setError("Ocorreu um erro desconhecido durante a transcrição.");
      }
      setStep('IDLE');
    }
  }, [audioFile]);
  
  const handleSync = useCallback(async () => {
    if (!audioFile || lyrics.length === 0) {
      setError("Não há letra para sincronizar.");
      return;
    }

    setStep('SYNCING');
    setError(null);

    try {
      const base64Audio = await fileToBase64(audioFile);
      const srtData: SrtBlock[] = await synchronizeLyrics(audioFile.type, base64Audio, lyrics);

      if (!srtData || srtData.length === 0) {
        throw new Error("A IA não retornou dados de legenda. A música pode não ter vocais claros ou o formato não é suportado.");
      }

      const srtString = jsonToSrt(srtData);
      setSrtResult(srtString);
      setStep('DONE');

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(`Ocorreu um erro na sincronização: ${err.message}`);
      } else {
        setError("Ocorreu um erro desconhecido durante a sincronização.");
      }
      setStep('EDITING'); // Go back to editing on sync error
    }
  }, [audioFile, lyrics]);
  
  const isLoading = step === 'TRANSCRIBING' || step === 'SYNCING';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
          
          <FileUpload onFileChange={handleFileChange} disabled={isLoading} />
          
          {audioFile && step === 'IDLE' && (
            <div className="mt-6 text-center">
              <button
                onClick={handleTranscribe}
                disabled={isLoading}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Transcrever Letra
              </button>
            </div>
          )}

          {step === 'TRANSCRIBING' && (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-indigo-400 animate-pulse">
                A IA está ouvindo e transcrevendo...
              </p>
               <p className="mt-2 text-sm text-gray-500">
                Isso pode levar alguns instantes.
              </p>
            </div>
          )}
          
          {step === 'EDITING' && (
            <LyricsEditor lyrics={lyrics} setLyrics={setLyrics} onSync={handleSync} isLoading={isLoading} audioFile={audioFile} />
          )}

          {step === 'SYNCING' && (
             <div className="mt-8 flex flex-col items-center justify-center text-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-indigo-400 animate-pulse">
                Sincronizando a letra com a música...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Ajustando os tempos para uma precisão perfeita.
              </p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p className="font-semibold">Erro</p>
              <p>{error}</p>
            </div>
          )}
          
          {step === 'DONE' && srtResult && (
            <>
              <SrtDisplay srtContent={srtResult} fileName={audioFile?.name.replace(/\.[^/.]+$/, "") || "legenda"} />
              <div className="mt-6 text-center">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2 border border-gray-600 text-gray-400 font-semibold rounded-lg hover:bg-gray-700 hover:text-gray-300 transition-colors"
                >
                  Começar de Novo
                </button>
              </div>
            </>
          )}

        </main>
        <footer className="text-center mt-12 text-gray-500">
          <p>Desenvolvido com React, Tailwind CSS, e Gemini AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
