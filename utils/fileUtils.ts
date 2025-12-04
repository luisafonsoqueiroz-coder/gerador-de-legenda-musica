import type { SrtBlock } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const normalizeTimestamp = (timestamp: string): string => {
  // Garante que o separador de milissegundos seja uma vírgula.
  const timeWithComma = timestamp.replace('.', ',');

  const parts = timeWithComma.split(':');
  
  // Formato HH:MM:SS,ms (correto)
  if (parts.length === 3) {
    return timeWithComma;
  }
  
  // Formato MM:SS,ms (precisa adicionar horas)
  if (parts.length === 2) {
    return `00:${timeWithComma}`;
  }
  
  // Formato SS,ms (precisa adicionar horas e minutos)
  if (parts.length === 1) {
    const secondsPart = timeWithComma.split(',')[0];
    const paddedTime = secondsPart.length < 2 ? `0${timeWithComma}` : timeWithComma;
    return `00:00:${paddedTime}`;
  }

  // Retorna como está se o formato for desconhecido
  return timeWithComma; 
};


export const jsonToSrt = (blocks: SrtBlock[]): string => {
  if (!blocks || blocks.length === 0) {
    return "";
  }
  
  // Sort blocks by their sequential ID to ensure correct order.
  const sortedBlocks = [...blocks].sort((a, b) => a.id - b.id);

  const srtContent = sortedBlocks
    .map(block => {
      // Normaliza os timestamps para o formato HH:MM:SS,ms.
      const startTime = normalizeTimestamp(block.startTime);
      const endTime = normalizeTimestamp(block.endTime);

      // Formato de bloco SRT básico:
      // 1
      // 00:00:01,234 --> 00:00:02,345
      // Texto da legenda
      return `${block.id}\r\n${startTime} --> ${endTime}\r\n${block.text}`;
    })
    .join('\r\n\r\n'); // Cada bloco é separado por duas quebras de linha.

  // Um arquivo SRT válido deve terminar com uma linha em branco após o último bloco de legenda para máxima compatibilidade.
  return srtContent + '\r\n\r\n';
};