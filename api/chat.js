
const MAX_QUERY_LENGTH = 10000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const query = body.query;
    const board =
      typeof body.board === "string" ? body.board.slice(0, 80) : "CDC";
    const lang =
      typeof body.lang === "string" ? body.lang.slice(0, 20) : "en";
    const provider =
      body.provider === "openai" ? "openai" : "gemini";

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(413).json({
        error: "Question is too long. Please shorten it."
      });
    }

    const apiKey =
      provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error:
          provider === "openai"
            ? "OpenAI API key is not configured in Vercel."
            : "Gemini API key is not configured in Vercel.",
        provider
      });
    }

    const instructions = [
      "You are Sikshya Global AI, a helpful educational tutor for students worldwide.",
      "Explain concepts accurately, clearly, and step by step.",
      "Use simple language and examples appropriate for the learner.",
      "Adapt to the requested curriculum and language.",
      "Curriculum: " + board + ". Language code: " + lang + ".",
      "Encourage learning, kindness, and critical thinking.",
      "Never invent facts when you are uncertain."
    ].join(" ");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      let response;
      let data;
      let answer = "";
      let model;

      if (provider === "openai") {
        model = "gpt-4.1-mini";

        response = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + apiKey
            },
            body: JSON.stringify({
              model,
              instructions,
              input: query.trim(),
              max_output_tokens: 2048,
              store: false
            })
          }
        );

        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error(
            "OpenAI error:",
            response.status,
            data.error?.message || "Request failed"
          );

          return res.status(
            response.status === 429 ? 429 : 502
          ).json({
            error:
              response.status === 429
                ? "OpenAI quota or rate limit reached. Try Gemini."
                : "OpenAI request failed. Check your API key, billing, and model access.",
            provider
          });
        }

        answer =
          typeof data.output_text === "string"
            ? data.output_text.trim()
            : (data.output || [])
                .flatMap(item => item.content || [])
                .filter(part => part.type === "output_text")
                .map(part => part.text || "")
                .join("\n")
                .trim();

      } else {
        model = "gemini-2.5-flash";

        response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" +
            model +
            ":generateContent",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: instructions }]
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: query.trim() }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        );

        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error(
            "Gemini error:",
            response.status,
            data.error?.message || "Request failed"
          );

          return res.status(
            response.status === 429 ? 429 : 502
          ).json({
            error:
              response.status === 429
                ? "Gemini quota or rate limit reached. Try OpenAI."
                : "Gemini request failed. Check your API key and model access.",
            provider
          });
        }

        answer = (data.candidates?.[0]?.content?.parts || [])
          .map(part => part.text || "")
          .join("\n")
          .trim();
      }

      if (!answer) {
        return res.status(502).json({
          error: "The AI returned an empty answer. Please try again.",
          provider
        });
      }

      return res.status(200).json({
        text: answer,
        provider,
        model,
        board
      });

    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error("Chat endpoint error:", error.name || "Error");

    return res.status(
      error.name === "AbortError" ? 504 : 500
    ).json({
      error:
        error.name === "AbortError"
          ? "The AI request timed out. Please try again."
          : "The AI service encountered an error."
    });
  }
}
