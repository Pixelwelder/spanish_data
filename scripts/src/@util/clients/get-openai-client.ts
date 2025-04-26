import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import fs from 'fs';
import { z } from 'zod';
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat';

const {
  OPENAI_API_KEY: apiKey,
} = process.env as {
  OPENAI_API_KEY: string;
};

let openAI: OpenAI | null = null;
const getOpenAI = () => {
  if (!openAI) openAI = new OpenAI({ apiKey });
  return openAI;
};

type CreateCompletionOptions = Omit<ChatCompletionCreateParamsStreaming, 'messages' | 'model' | 'stream'>;

const createCompletion = async <T = string>(
  prompt: string,
  options: CreateCompletionOptions = {},
): Promise<T> => {
  const _openAI = getOpenAI();
  const stream = await _openAI.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: true,
    ...options,
  });

  let content = '';
  for await (const chunk of stream) {
    content += chunk.choices[0]?.delta?.content || '';
  }

  return (options.response_format ? JSON.parse(content) : content) as T;
};

const createTranscription = async (audio: string) => {
  const _openAI = getOpenAI();
  const stream = await _openAI.audio.transcriptions.create({
    file: fs.createReadStream(audio),
    model: 'whisper-1',
  });

  return stream.text;
};

// const analyzeImages = async (images: string[], transcription: string, stats: Stats): Promise<VideolyzerImagesAnalysis> => {
//   const _openAI = getOpenAI();
//   const imageMessages = images.map((image) => ({
//     type: "image_url" as const,
//     image_url: {
//       url: image,
//     },
//   }));

//   const shape = z.object({
//     summary: z.string(),
//     mainBooks: z.array(z.object({
//       title: z.string(),
//       author: z.string(),
//       matches: z.array(z.object({
//         title: z.string(),
//         author: z.string(),
//         isbn10: z.string(),
//         isbn13: z.string(),
//         imageUrl: z.string(),
//       })),
//     })),
//     otherBooks: z.array(z.object({
//       title: z.string(),
//       author: z.string(),
//       matches: z.array(z.object({
//         title: z.string(),
//         author: z.string(),
//         isbn10: z.string(),
//         isbn13: z.string(),
//         imageUrl: z.string(),
//       })),
//     })),
//   });

//   const completion = await _openAI.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "user",
//         content: [
//           { type: "text", text: `I am including either stills from a video or a tranascription for a video, or both. What books are being discussed? Give titles nad authors if possible. Focus on foreground books. Transcription: "${transcription}".` },
//           ...imageMessages,
//         ],
//       },
//     ],
//     response_format: zodResponseFormat(shape, 'videolyzer_analysis'),
//     store: true,
//   });

//   stats.addMessage(completion?.choices[0]?.message.content || 'Failed to analyze the images.');

//   const empty: VideolyzerImagesAnalysis = {
//     summary: '(No summary)',
//     mainBooks: [],
//     otherBooks: [],
//   };

//   let json = empty;
//   if (completion?.choices[0]?.message?.content) {
//     try {
//       json = JSON.parse(completion?.choices[0]?.message?.content) as VideolyzerImagesAnalysis;

//       // Add empty matches to each book.
//       // json.mainBooks = [];
//       // json.otherBooks = [];
//     } catch (error) {
//       stats.addMessage('Failed to parse the analysis.');
//     }
//   }
  
//   return json;
// };

export {
  createCompletion,
  createTranscription,
  // analyzeImages,
};
