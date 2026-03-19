const BASE_URL = "http://127.0.0.1:8000";

export const videoAPI = {

  // Upload local video
  uploadVideo: async (file: File) => {

    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch(`${BASE_URL}/videos/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Video upload failed");
    }

    return response.json();
  },


  // Process URL
  processUrl: async (url: string) => {

    const response = await fetch(`${BASE_URL}/videos/process-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error("Video processing failed");
    }

    return response.json();
  },


  // Get chapters
  getChapters: async (videoId: string) => {

    const response = await fetch(`${BASE_URL}/videos/${videoId}/chapters`);

    if (!response.ok) {
      throw new Error("Failed to fetch chapters");
    }

    return response.json();
  },


  // Semantic search
  searchVideo: async (videoId: string, query: string) => {

    const response = await fetch(`${BASE_URL}/videos/${videoId}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return response.json();
  }

};
