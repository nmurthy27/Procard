import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini API Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Bio Helper Endpoint
app.post("/api/bio-helper", async (req, res) => {
  const { currentBio, name, title } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const prompt = `You are a professional networking coach. 
    User Name: ${name}
    Current Title: ${title}
    Draft Bio: ${currentBio}
    
    Task: Improve this bio to be professional, engaging, and suitable for a digital networking card. 
    Keep it concise (max 300 characters). Return only the improved bio text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ improvedBio: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to enhance bio" });
  }
});

// AI Photo Beautify Endpoint
app.post("/api/beautify-photo", async (req, res) => {
  const { choice } = req.body; // choice could be 'professional', 'creative', 'warm'
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    // For now, Gemini helps us "calculate" the best CSS filters for a specific vibe
    // based on typical professional photography standards.
    const prompt = `You are an expert photo editor and UI designer.
    The user wants to "beautify" their professional profile picture.
    Choice: ${choice} (e.g., 'professional', 'creative', 'warm', 'dramatic')
    
    Task: Return a JSON object with CSS filter properties that would achieve this look. 
    Valid properties: brightness, contrast, grayscale, sepia, saturate, hue-rotate, blur.
    
    Format: {"filter": "brightness(1.1) contrast(1.05)...", "reasoning": "Brief explanation"}
    Keep it subtle and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const result = JSON.parse(response.text.replace(/```json|```/g, "").trim());
    res.json(result);
  } catch (error) {
    console.error("Beautify Error:", error);
    res.status(500).json({ error: "Failed to beautify photo" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
