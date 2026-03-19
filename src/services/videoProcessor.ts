// src/services/videoProcessor.ts
import { videoAPI } from "./api";

class VideoProcessor {
  // -----------------------------
  // Process uploaded video file
  // -----------------------------
  async processVideo(file: File): Promise<any> {
    const response: any = await videoAPI.uploadVideo(file);
    const videoId = response.videoId ?? response.video_id;

    const chapters: any = await videoAPI.getChapters(videoId);

    return {
      videoId,
      chapters: chapters.chapters ?? chapters.data ?? []
    };
  }

  // -----------------------------
  // Process video URL
  // -----------------------------
  async processVideoUrl(url: string): Promise<any> {
    const res: any = await videoAPI.processUrl(url);
    const videoId = res.videoId ?? res.video_id;

    return {
      videoId,
      video_url: res.video_url || res.url || url,
      chapters: res.chapters ?? res.data ?? []
    };
  }

  // -----------------------------
  // Process YouTube video
  // -----------------------------
  async processYoutubeVideo(url: string): Promise<any> {
    const response = await fetch("http://localhost:8000/videos/process-youtube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error("YouTube processing failed");
    }

    const res = await response.json();

    return {
      videoId: res.videoId ?? res.video_id,
      video_url: res.video_url,
      chapters: res.chapters ?? []
    };
  }

  // -----------------------------
  // Semantic search
  // -----------------------------
  async searchInVideo(videoId: string, query: string) {
    const results: any = await videoAPI.searchVideo(videoId, query);
    return results.results;
  }
}

export const videoProcessor = new VideoProcessor();
