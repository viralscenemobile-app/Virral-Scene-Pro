export async function getViewUrl(key: string) {
  const response = await fetch(`/api/r2/view-url?key=${encodeURIComponent(key)}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get view URL");
  }

  const { url } = await response.json();
  return url;
}

export async function getUploadUrl(fileName: string, contentType: string) {
  const response = await fetch("/api/r2/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, contentType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get upload URL");
  }

  const { url } = await response.json();
  return url;
}

export function getPublicUrl(fileName: string) {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!publicUrl) return `https://placeholder.r2.dev/${fileName}`;
  const baseUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  return `${baseUrl}/${fileName}`;
}
