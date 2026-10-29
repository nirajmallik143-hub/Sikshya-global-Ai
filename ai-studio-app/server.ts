import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));

  // API Route for Gemini Educational Coaching
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, board, language, imageBase64, mimeType, apiKey } = req.body;
      const keyToUse = apiKey || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        return res.status(400).json({
          error: 'No Gemini API key configured. Set GEMINI_API_KEY on the server or add your key in the app.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const parts: any[] = [];

      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const systemInstruction = `You are Sikshya Global AI, a universal educational coach developed by Niraj Mallik (Mallik Group 7G Quantum Architecture) under the MIT License to make human beings happy and support learners worldwide.
Curriculum Board: ${board || 'GENERAL / GLOBAL'}
Target Response Language: ${language || 'English'}
Instructions:
- Provide clear, step-by-step academic explanations with formulas, mathematical derivations, clear real-world examples, and uplifting guidance.
- Address questions thoroughly for academic mastery (Science, Physics, Mathematics, Chemistry, Biology, Computer Science, Literature, Economics).
- If analyzing notes or homework images, solve all problems methodically with step-by-step verification.`;

      parts.push({
        text: `${systemInstruction}\n\nStudent Question / Request:\n${prompt || 'Please explain and solve this note / homework problem.'}`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate educational coaching response',
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sikshya Global AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
