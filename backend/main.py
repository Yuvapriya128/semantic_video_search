from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
import re

# Import your video processing logic
from video_logic import (
    process_video,
    get_chapters_for_video,
    semantic_video_search,
    download_youtube_video
)

app = FastAPI(title="Semantic Video Search API 🚀")

# -----------------------------
# CORS (Required for React)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Serve downloaded videos
# -----------------------------
# -----------------------------
# Serve downloaded & uploaded videos
# -----------------------------
os.makedirs("downloads", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

app.mount("/downloads", StaticFiles(directory="downloads"), name="downloads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# -----------------------------
# Request Models
# -----------------------------
class VideoURL(BaseModel):
    url: str

class SearchQuery(BaseModel):
    query: str

# -----------------------------
# Global store for video chapters
# -----------------------------
video_chapters_store = {}

# -----------------------------
# Utility: Sanitize filenames
# -----------------------------
def sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-\.]", "_", name)

# -----------------------------
# Root endpoint
# -----------------------------
@app.get("/")
def root():
    return {"message": "Semantic Video Search Backend Running 🚀"}

# -----------------------------
# Upload Video File
# -----------------------------
@app.post("/videos/upload")
async def upload_video(video: UploadFile = File(...)):
    try:
        upload_folder = "uploads"
        os.makedirs(upload_folder, exist_ok=True)

        sanitized_filename = sanitize_filename(video.filename)
        file_path = os.path.join(upload_folder, sanitized_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        print("Video uploaded:", file_path)

        # Process video
        process_video(file_path)

        chapters = get_chapters_for_video()

        video_chapters_store[sanitized_filename] = chapters

        return {
            "videoId": sanitized_filename,
            "chapters": chapters,
            "video_url": f"http://localhost:8000/uploads/{sanitized_filename}"
        }

    except Exception as e:
        print("Error uploading video:", e)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Process Video URL
# -----------------------------
@app.post("/videos/process-url")
async def process_video_url(data: VideoURL):
    try:
        url = data.url
        print("Processing video URL:", url)

        sanitized_id = sanitize_filename(url)

        process_video(url)

        chapters = get_chapters_for_video()

        video_chapters_store[sanitized_id] = chapters

        return {
            "videoId": sanitized_id,
            "chapters": chapters,
            "video_url": url
        }

    except Exception as e:
        print("Error processing video URL:", e)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Get Chapters
# -----------------------------
@app.get("/videos/{video_id}/chapters")
def get_chapters(video_id: str):

    sanitized_id = sanitize_filename(video_id)

    chapters = video_chapters_store.get(sanitized_id)

    if chapters is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "videoId": sanitized_id,
        "chapters": chapters
    }

# -----------------------------
# Semantic Search
# -----------------------------
@app.post("/videos/{video_id}/search")
def search_video(video_id: str, data: SearchQuery):

    sanitized_id = sanitize_filename(video_id)

    if sanitized_id not in video_chapters_store:
        raise HTTPException(status_code=404, detail="Video not found")

    query = data.query

    print(f"Search query for video '{sanitized_id}':", query)

    try:
        results = semantic_video_search(query)

        return {
            "videoId": sanitized_id,
            "results": results
        }

    except Exception as e:
        print("Error during semantic search:", e)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Process YouTube Video
# -----------------------------
@app.post("/videos/process-youtube")
async def process_youtube_video(data: VideoURL):

    try:
        url = data.url

        print("Downloading YouTube video:", url)

        # 1️⃣ Download video
        video_path = download_youtube_video(url)

        print("Downloaded file:", video_path)

        # 2️⃣ Sanitize filename
        filename = os.path.basename(video_path)
        sanitized_filename = sanitize_filename(filename)

        safe_path = os.path.join("downloads", sanitized_filename)

        if video_path != safe_path:
            os.rename(video_path, safe_path)

        video_path = safe_path

        # 3️⃣ Process video
        process_video(video_path)

        # 4️⃣ Generate chapters
        chapters = get_chapters_for_video()

        video_chapters_store[sanitized_filename] = chapters

        print("Chapters generated:", len(chapters))

        # 5️⃣ Video URL for frontend
        video_url = f"http://localhost:8000/downloads/{sanitized_filename}"

        return {
            "videoId": sanitized_filename,
            "video_url": video_url,
            "chapters": chapters
        }

    except Exception as e:
        print("Error processing YouTube video:", e)
        raise HTTPException(status_code=500, detail=str(e))
