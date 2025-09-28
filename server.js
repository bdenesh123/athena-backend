// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Pick a valid model from your available list
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt = `You are a helpful AI assistant. Answer clearly and politely.
User said: "${message}"`;

    const result = await model.generateText({ prompt });

    res.json({
      reply: result?.candidates?.[0]?.output || "No reply from Gemini.",
    });
  } catch (err) {
    console.error("Gemini API error details:", err);
    res.status(500).json({ error: err.message || "Error talking to Gemini" });
  }
});

const PORT = 8000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
