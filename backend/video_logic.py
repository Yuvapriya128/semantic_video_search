# -*- coding: utf-8 -*-

import subprocess
import os
import whisper
import numpy as np
import faiss
import nltk
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer, CrossEncoder
from keybert import KeyBERT
import re
import time
from google import genai
from yt_dlp import YoutubeDL

# ---------------- Gemini API Key ----------------
os.environ["GEMINI_API_KEY"] = "AIzaSyAFLt-L1SwdJMGBj4Px7PjaPWugsLvwIwA"
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ---------------- NLTK ----------------
nltk.download("punkt")
nltk.download("stopwords")

# ---------------- GLOBALS ----------------
transcript_segments = []  # for semantic search
segments = []             # chapters for frontend
index = None

# ---------------- LOAD MODELS ----------------
whisper_model = whisper.load_model("base")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
kw_model = KeyBERT(model=embed_model)

# ---------------- DOWNLOAD YOUTUBE VIDEO ----------------
def download_youtube_video(url: str, output_folder="downloads"):

    os.makedirs(output_folder, exist_ok=True)

    ydl_opts = {
        "format": "bestvideo+bestaudio/best",
        "outtmpl": os.path.join(output_folder, "%(id)s.%(ext)s"),
        "merge_output_format": "mp4",
        "quiet": True
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    video_id = info["id"]
    final_path = os.path.join(output_folder, f"{video_id}.mp4")

    print("Downloaded:", final_path)

    return final_path


# ---------------- EXTRACT AUDIO ----------------
def extract_audio(video_path, audio_path="audio.wav"):

    command = [
        "ffmpeg",
        "-y",
        "-i",
        video_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        audio_path
    ]

    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    return audio_path


# ---------------- TRANSCRIBE ----------------
def transcribe_audio(audio_path):

    result = whisper_model.transcribe(
        audio_path,
        language="en",
        task="transcribe",
        fp16=False
    )

    whisper_segments = []

    for seg in result["segments"]:

        whisper_segments.append({
            "text": seg["text"].strip(),
            "start": seg["start"],
            "end": seg["end"]
        })

    return whisper_segments


# ---------------- BUILD SEMANTIC SEGMENTS ----------------
def build_segments(whisper_segments, max_sentences=3):

    segments_list = []

    buffer_text = []

    start_time = whisper_segments[0]["start"]

    for seg in whisper_segments:

        sentences = sent_tokenize(seg["text"])

        for sent in sentences:

            buffer_text.append(sent)

            if len(buffer_text) >= max_sentences:

                end_time = seg["end"]

                segments_list.append({
                    "text": " ".join(buffer_text),
                    "start": start_time,
                    "end": end_time
                })

                buffer_text = []

                start_time = end_time   

    if buffer_text:

        segments_list.append({
            "text": " ".join(buffer_text),
            "start": start_time,
            "end": whisper_segments[-1]["end"]
        })

    return segments_list

# ---------------- CHAPTER TITLES ----------------
def clean_chapter_text(text, max_chars=600):

    text = text.replace("\n", " ")

    sentences = text.split(".")

    clean = []

    total = 0

    for s in sentences:

        if total + len(s) > max_chars:
            break

        clean.append(s.strip())

        total += len(s)

    return ". ".join(clean)


def parse_titles(text, n):

    if not text:
        return [f"Chapter {i+1}" for i in range(n)]

    titles = []

    for line in text.splitlines():

        m = re.match(r"\s*\d+[\.\)]\s*(.+)", line)

        if m:
            titles.append(m.group(1).strip())

    while len(titles) < n:
        titles.append(f"Chapter {len(titles)+1}")

    return titles[:n]


def title_all_chapters(chapters):

    prompt = "Generate YouTube style chapter titles.\n\n"

    for i, ch in enumerate(chapters, 1):
        clean = clean_chapter_text(ch["text"])
        prompt += f"Chapter {i} transcript:\n{clean}\n\n"

    prompt += f"""
Generate EXACTLY {len(chapters)} titles.

Rules:
1. Number them from 1 to {len(chapters)}
2. Format: 1. Title
3. One title per line
4. Titles must be 1-3 words
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # --- Extract Gemini text safely ---
    raw_text = None

    if hasattr(response, "text") and response.text:
        raw_text = response.text

    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        texts = [p.text for p in parts if hasattr(p, "text")]
        raw_text = " ".join(texts)

    return parse_titles(raw_text, len(chapters))


def keybert_fallback_title(text):

    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(2,4),
        stop_words="english",
        top_n=1
    )

    if keywords:
        return keywords[0][0].title()

    return "Topic Overview"


# ---------------- PROCESS VIDEO ----------------
def process_video(video_path):

    global transcript_segments, segments, index

    audio_path = extract_audio(video_path)

    raw_segments = transcribe_audio(audio_path)

    transcript_segments = build_segments(raw_segments)

    # ---------------- FAISS INDEX ----------------
    texts = [seg["text"] for seg in transcript_segments]

    embeddings = embed_model.encode(
        texts,
        normalize_embeddings=True
    ).astype(np.float32)

    dim = embeddings.shape[1]

    index = faiss.IndexFlatIP(dim)

    index.add(embeddings)

    # ---------------- SIMPLE CHAPTER SPLIT ----------------
    MIN_CHAPTER_SEC = 120

    chapters = []

    current = transcript_segments[0]

    start = current["start"]

    text = current["text"]

    for seg in transcript_segments[1:]:

        if seg["start"] - start > MIN_CHAPTER_SEC:

            chapters.append({
                "start": start,
                "text": text
            })

            start = seg["start"]

            text = seg["text"]

        else:

            text += " " + seg["text"]

    chapters.append({
        "start": start,
        "text": text
    })

    titles = title_all_chapters(chapters)

    segments = []

    video_duration = transcript_segments[-1]["end"]

    for i, ch in enumerate(chapters):

        title = titles[i]

        if not title or len(title.split()) < 2:
            title = keybert_fallback_title(ch["text"])

        start = ch["start"]

        if i + 1 < len(chapters):
            end = chapters[i+1]["start"]
        else:
            end = video_duration

        segments.append({
            "title": title,
            "text": ch["text"],
            "start": start,
            "end": end
        })

    print("Video processed")
    print("Transcript segments:", len(transcript_segments))
    print("Chapters:", len(segments))


# ---------------- FAISS SIMILARITY CHECK ----------------
def max_similarity_from_faiss(query):

    if index is None:
        return 0

    query_emb = embed_model.encode(
        [query],
        normalize_embeddings=True
    ).astype(np.float32)

    scores, _ = index.search(query_emb, 1)

    return float(scores[0][0])


# ---------------- RETRIEVE + RERANK ----------------
def retrieve_with_rerank(query, top_k=5, candidate_k=20):

    if index is None or not transcript_segments:
        return []

    query_emb = embed_model.encode(
        [query],
        normalize_embeddings=True
    ).astype(np.float32)

    scores, indices = index.search(query_emb, candidate_k)

    pairs = [
        (query, transcript_segments[idx]["text"])
        for idx in indices[0]
    ]

    cross_scores = cross_encoder.predict(pairs)

    ranked = sorted(
        zip(indices[0], cross_scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        transcript_segments[idx]
        for idx, _ in ranked[:top_k]
    ]


# ---------------- TIME FORMAT ----------------
def seconds_to_hhmmss(seconds):

    seconds = int(seconds)

    h = seconds // 3600

    m = (seconds % 3600) // 60

    s = seconds % 60

    return f"{h:02d}:{m:02d}:{s:02d}"


# ---------------- SEMANTIC SEARCH ----------------
def semantic_video_search(query, top_k=5):

    similarity = max_similarity_from_faiss(query)

    if similarity < 0.30:
        return []

    results = retrieve_with_rerank(query, top_k)

    formatted_results = []

    for r in results:

        chapter_name = ""

        for ch in segments:

            if ch["start"] <= r["start"] < ch["end"]:
                chapter_name = ch["title"]
                break

        formatted_results.append({
            "text": "",
            "timestamp": r["start"],
            "start_time": seconds_to_hhmmss(r["start"]),
            "end_time": seconds_to_hhmmss(r["end"]),
            "score": 0,
            "chapter": chapter_name
        })

    return formatted_results


# ---------------- CHAPTER API ----------------
def get_chapters_for_video():

    if not segments:
        return []

    return [
        {
            "title": seg["title"],
            "text": seg["text"],
            "start": seg["start"],
            "end": seg["end"],
            "startFormatted": seconds_to_hhmmss(seg["start"])
        }
        for seg in segments
    ]