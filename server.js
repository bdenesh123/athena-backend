const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();

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

app.use(bodyParser.json());

//  Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint (Gemini)
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });

    const prompt = `You are a helpful AI assistant. Answer clearly and politely. 
    User said: "${message}"`;

    const result = await model.generateContent(prompt);

    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini API error details:", err);
    res.status(500).json({ error: err.message || "Error talking to Gemini" });
  }
});

const PORT = 8000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
