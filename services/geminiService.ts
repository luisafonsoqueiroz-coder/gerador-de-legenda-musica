import { GoogleGenAI, Type } from "@google/genai";
import type { SrtBlock } from '../types';

const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const transcribeAudio = async (mimeType: string, base64Audio: string): Promise<string[]> => {
  const ai = getAi();
  
  const audioPart = { inlineData: { mimeType, data: base64Audio } };
  const textPart = { text: `Você é uma ferramenta especialista em transcrição de áudio. Sua única tarefa é ouvir o áudio da música e transcrever a letra.
  
  **REGRAS:**
  1.  **FORMATO JSON:** Retorne a letra como um array JSON de strings, onde cada string é uma linha ou frase significativa da música.
  2.  **SAÍDA LIMPA:** A saída deve conter APENAS o array JSON, sem nenhum texto ou formatação adicional.
  3.  **SEM VOCAIS:** Se a música for instrumental ou não tiver vocais claros, retorne um array JSON vazio: \`[]\`.
  
  Exemplo de saída:
  \`\`\`json
  [
    "Hello, it's me",
    "I was wondering if after all these years you'd like to meet",
    "To go over everything"
  ]
  \`\`\`
  
  Transcreva o áudio fornecido.` };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [audioPart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as string[];
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini (transcription):", jsonText);
    throw new Error("A resposta da IA para a transcrição não estava em um formato JSON válido.");
  }
};


export const synchronizeLyrics = async (mimeType: string, base64Audio: string, lyrics: string[]): Promise<SrtBlock[]> => {
  const ai = getAi();

  const audioPart = { inlineData: { mimeType, data: base64Audio } };

  const textPart = {
    text: `Você é uma ferramenta especialista em sincronização de áudio, focada em criar legendas SRT perfeitas para músicas. Você receberá um arquivo de áudio e um array de strings contendo a letra já transcrita. Sua tarefa é ouvir atentamente a música e atribuir um timestamp de início e fim para CADA FRASE fornecida no texto, seguindo regras estritas de precisão.

**REGRAS CRÍTICAS PARA A SAÍDA:**

1.  **USE O TEXTO FORNECIDO:** Você DEVE usar o texto exato de cada item do array de letras fornecido. Não altere, corrija ou omita o texto. Sua única tarefa é encontrar o tempo dele no áudio.
2.  **FORMATO JSON:** A saída DEVE ser um array JSON de objetos, e nada mais.
3.  **ESTRUTURA DO OBJETO:** Cada objeto deve conter:
    *   \`id\`: Número sequencial da legenda, começando em 1.
    *   \`startTime\`: Timestamp de início no formato \`HH:MM:SS,ms\`.
    *   \`endTime\`: Timestamp de fim no formato \`HH:MM:SS,ms\`.
    *   \`text\`: O trecho da letra, exatamente como foi fornecido na entrada.
4.  **FORMATO DE TIMESTAMP (MUITO IMPORTANTE):** O formato do timestamp DEVE ser estritamente \`HH:MM:SS,ms\`, incluindo horas, minutos, segundos e milissegundos, mesmo que as horas sejam zero. **Exemplo correto: \`00:00:42,547\`. Exemplo incorreto: \`00:42,547\`.**
5.  **SINCRONIZAÇÃO PRECISA (REGRA MAIS IMPORTANTE):**
    *   O \`startTime\` deve marcar o início **EXATO** da fala/canto da frase correspondente no áudio.
    *   O \`endTime\` deve marcar o fim **EXATO** da fala/canto.
    *   **É PERMITIDO e ESPERADO que existam pausas (gaps) entre as legendas.** A precisão do tempo é fundamental.
    *   Se uma linha de texto fornecida não puder ser encontrada no áudio, simplesmente omita-a da saída final. Não inclua objetos para textos não encontrados.
6.  **ID SEQUENCIAL:** O campo 'id' na saída deve ser sequencial e correto, mesmo que algumas linhas de texto de entrada sejam omitidas.

Aqui está a letra que você deve sincronizar:
${JSON.stringify(lyrics, null, 2)}

Analise o áudio e sincronize o texto fornecido, gerando o array JSON de legendas seguindo TODAS estas regras estritamente.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [audioPart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "Um array de blocos de legenda SRT.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.NUMBER,
              description: "Índice sequencial da legenda, começando em 1."
            },
            startTime: {
              type: Type.STRING,
              description: "Timestamp de início no formato HH:MM:SS,ms."
            },
            endTime: {
              type: Type.STRING,
              description: "Timestamp de fim no formato HH:MM:SS,ms."
            },
            text: {
              type: Type.STRING,
              description: "A linha de letra transcrita."
            },
          },
          required: ['id', 'startTime', 'endTime', 'text']
        }
      },
    },
  });
  
  const jsonText = response.text.trim();
  
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as SrtBlock[];
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini (synchronization):", jsonText);
    throw new Error("A resposta da IA para a sincronização não estava em um formato JSON válido.");
  }
};