# Sikshya Global AI

**Free Universal Education AI for every student on Earth**  
Developed by **Niraj Mallik (Mallik Group)** under the **MIT License**

> Mission: Help humanity and make human beings happy through free, high-quality education.

**Live site:** https://sikshya-global-ai.vercel.app  
**GitHub:** https://github.com/nirajmallik143-hub/Sikshya-global-Ai

---

## Features

- Multilingual AI coaching (English, Nepali, Hindi, Urdu, Bengali, Chinese, Japanese, Arabic, Spanish, French, and more)
- Real-time voice conversation
- Camera scan & file upload for homework
- Board selection: Nepal CDC, NEB, Cambridge, IB, CBSE
- Study alarms & Pomodoro
- Global peer problem-solving group
- EMAX level-based quiz game
- Secure Gemini proxy (API key never exposed in browser)
- Offline educational fallback answers so students always get help

---

## Quick Setup (Vercel + Secure Proxy)

### 1. Upload these files to the repository
- `index.html` (updated frontend)
- `api/chat.js` (serverless proxy)
- `vercel.json`
- `.env.example` (reference only)

### 2. Add the secret key in Vercel
1. Go to your Vercel project → **Settings → Environment Variables**
2. Create:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your free key from https://aistudio.google.com/apikey
3. Select Production + Preview + Development
4. Save

### 3. Redeploy
Push the files or click **Redeploy** in Vercel.

---

## How the secure proxy works

```
Student browser  →  /api/chat  →  Gemini API
                       ↑
               Key lives only here
               (Vercel environment variable)
```

The API key is **never** visible in the browser or in the public HTML.

---

## Offline Mode

Even if the Gemini key is missing or the network fails, students still receive clear educational answers for:

- Quantum Physics & Energy Formulas
- Photosynthesis
- Newton’s Laws of Motion
- Quadratic Equations
- And more topics are easy to add

---

## Contact & Mission

**Developer:** Niraj Mallik  
Email: nirajmallik143@gmail.com  
WhatsApp: +971 50 229 7451  

This project is free forever under the MIT License so that every child, in every country, can learn and rise.

**Help humanity. Make human beings happy.**
