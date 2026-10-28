// Vercel Serverless Function - keeps Gemini API key server-side
// File: /api/chat.js

export default async function handler(req, res) {
  // CORS headers for the frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, board = 'CDC', lang = 'en' } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or empty query' });
    }

    // API key is stored in Vercel Environment Variable (never in code)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured on server',
        offline: true
      });
    }

    const systemInstruction = `You are Sikshya Global AI, an expert tutor under MIT License by Niraj Mallik (Mallik Group) dedicated to helping humanity and making human beings happy. Contact: nirajmallik143@gmail.com, +971502297451. Speak words that help humanity, answer accurately for ${board} curriculum in language code ${lang}. Keep answers clear, educational and encouraging for students.`;

    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/\( {model}:generateContent?key= \){GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Gemini API error:', data.error || data);
      return res.status(502).json({
        error: data.error?.message || 'Gemini API request failed',
        offline: true
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(502).json({
        error: 'Empty response from Gemini',
        offline: true
      });
    }

    return res.status(200).json({
      text: aiText,
      model: model,
      board: board
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      offline: true
    });
  }
}