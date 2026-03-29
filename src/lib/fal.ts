import * as fal from "@fal-ai/serverless-client";

// Initialize fal client with the provided key
// In a real app, this should be handled securely on the server
// but for this applet we'll use it directly in the client as requested.
const FAL_KEY = process.env.FAL_KEY;

fal.config({
  credentials: FAL_KEY,
});

export async function generateVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  if (!prompt) throw new Error("Prompt is required for video generation");

  try {
    const result: any = await fal.subscribe("fal-ai/kling-video/v1/standard/text-to-video", {
      input: {
        prompt: prompt,
        aspect_ratio: aspectRatio,
      },
      pollInterval: 5000,
    });

    if (!result.video?.url) {
      throw new Error("No video URL returned from fal.ai");
    }

    const response = await fetch(result.video.url);
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

    return await response.blob();
  } catch (error) {
    console.error("Error generating video with fal.ai:", error);
    throw error;
  }
}

export async function generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
  if (!prompt) throw new Error("Prompt is required for image generation");

  try {
    const result: any = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: aspectRatio === "1:1" ? "square" : aspectRatio === "16:9" ? "landscape_16_9" : "portrait_9_16",
      },
    });

    if (!result.images?.[0]?.url) {
      throw new Error("No image URL returned from fal.ai");
    }

    const response = await fetch(result.images[0].url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    return await response.blob();
  } catch (error) {
    console.error("Error generating image with fal.ai:", error);
    throw error;
  }
}

export async function generateVideoFromImage(imageBlob: Blob, prompt?: string, aspectRatio: "16:9" | "9:16" = "9:16") {
  if (!imageBlob) throw new Error("Image blob is required for image-to-video generation");

  try {
    // Convert blob to base64 for fal.ai
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageBlob);
    });
    const base64Image = await base64Promise;

    const result: any = await fal.subscribe("fal-ai/kling-video/v1/standard/image-to-video", {
      input: {
        prompt: prompt || "Animate this image beautifully",
        image_url: base64Image,
        aspect_ratio: aspectRatio,
      },
      pollInterval: 5000,
    });

    if (!result.video?.url) {
      throw new Error("No video URL returned from fal.ai");
    }

    const response = await fetch(result.video.url);
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

    return await response.blob();
  } catch (error) {
    console.error("Error generating video from image with fal.ai:", error);
    throw error;
  }
}
