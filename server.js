// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// Allow your frontend URLs
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://athena-ai-project.vercel.app", // production frontend
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper: get available models from Google Gemini
const getAvailableModel = async () => {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const data = await res.json();

    // Pick the first model that supports generateContent
    const model = data.models?.find((m) =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!model) throw new Error("No valid model found for generateContent");

    return model.name; // e.g., "models/gemini-1.5-pro"
  } catch (err) {
    console.error("Error fetching models:", err);
    throw err;
  }
};

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const modelName = await getAvailableModel();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reply from Gemini.";

    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ reply: "Error contacting Gemini API" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
