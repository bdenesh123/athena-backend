import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://athena-ai-project.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

const client = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await client.responses.create({
      model: "models/gemini-2.5-flash",
      input: [
        {
          role: "user",
          content: message,
        },
      ],
    });
    res.json({
      reply: response.output_text || "No reply from Gemini.",
    });
  } catch (err) {
    console.error("Gemini API error details:", err);
    res.status(500).json({ error: err.message || "Error talking to Gemini" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
