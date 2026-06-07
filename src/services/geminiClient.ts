import { GoogleGenAI } from '@google/genai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn('Missing Gemini API key. Check your .env.local file.');
}

export const geminiClient = new GoogleGenAI({
  apiKey: geminiApiKey || '',
});
