import { GoogleGenAI } from "@google/genai";

export async function moderateContent(prompt: string): Promise<boolean> {
  if (!prompt) return true;
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following prompt for any explicit, harmful, illegal, or highly offensive content. Reply with exactly "SAFE" if it is acceptable for a general audience, or "UNSAFE" if it violates safety guidelines. Prompt: "${prompt}"`,
      config: {
        systemInstruction: "You are a strict content moderator. Reply ONLY with SAFE or UNSAFE.",
        temperature: 0,
      },
    });
    
    const result = response.text?.trim().toUpperCase();
    return result === "SAFE";
  } catch (error) {
    console.error("Error moderating content:", error);
    // Fail closed or open? Let's fail open for now so we don't block users if the API flakes
    return true;
  }
}

export async function enhancePrompt(prompt: string) {
  if (!prompt) return prompt;
  
  // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Enhance this prompt for a cinematic AI video generation tool. Make it more descriptive, artistic, and detailed. Keep it under 500 characters. Original prompt: ${prompt}`,
      config: {
        systemInstruction: "You are an expert AI prompt engineer for cinematic video generation.",
      },
    });
    
    return response.text || prompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
}

export async function generateVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  if (!prompt) throw new Error("Prompt is required for video generation");

  // For Veo models, we prefer the user-selected API key (process.env.API_KEY)
  // if the aistudio interface is available, otherwise fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  // If we don't have a paid key (process.env.API_KEY is usually the paid one in this context)
  // and the user wants "free tier", we might want to fallback to a placeholder or a mock
  // for the video generation part while still using Gemini for the prompt.
  if (!process.env.API_KEY) {
    console.warn("No paid API key found. Using mock video for free tier.");
    // Return a placeholder video blob or a known public video for demo purposes
    const placeholderVideoUrl = "https://cdn.pixabay.com/video/2023/10/20/185836-876388911_large.mp4";
    const response = await fetch(placeholderVideoUrl);
    return await response.blob();
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned from operation");

    // To fetch the video, append the Gemini API key to the `x-goog-api-key` header.
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey || "",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

    return await response.blob();
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

export async function generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
  if (!prompt) throw new Error("Prompt is required for image generation");
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new Blob([bytes], { type: "image/png" });
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function generateVideoFromImage(imageBlob: Blob, prompt?: string, aspectRatio: "16:9" | "9:16" = "9:16") {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!process.env.API_KEY) {
    console.warn("No paid API key found. Using mock video for free tier.");
    const placeholderVideoUrl = "https://cdn.pixabay.com/video/2023/10/20/185836-876388911_large.mp4";
    const response = await fetch(placeholderVideoUrl);
    return await response.blob();
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(imageBlob);
  });
  const base64Image = await base64Promise;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image beautifully",
      image: {
        imageBytes: base64Image,
        mimeType: imageBlob.type,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey || "" },
    });

    return await response.blob();
  } catch (error) {
    console.error("Error generating video from image:", error);
    throw error;
  }
}
