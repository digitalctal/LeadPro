import { GoogleGenAI } from "@google/genai";

// Safely access process.env for browser compatibility
const getApiKey = () => {
  try {
    // Check environment first, then localStorage (set via Settings page)
    return process.env.API_KEY || localStorage.getItem('lt_api_key') || '';
  } catch (e) {
    return '';
  }
};

export const generateFollowUpEmail = async (leadName: string, notes: string, type: string) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("API Key not found. Returning template.");
    return `Subject: Follow up with ${leadName}\n\nHi ${leadName},\n\nI hope you are doing well. I wanted to follow up regarding our previous conversation.\n\nBest,\n[Your Name]`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a professional, short, and friendly follow-up ${type} script (or email body) for a lead named ${leadName}. 
        Here are the notes from our last interaction: "${notes}". 
        Keep it under 100 words. Do not include placeholders like [Your Name].`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating draft. Please check your API key in Settings.";
  }
};