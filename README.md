# RTSP Livestream Starter (Flask + Mongo + React)

This project is a Flask + FFmpeg based livestreaming app that plays an RTSP video stream and allows users to add custom overlays (logos, text, etc.).
It provides a CRUD API for overlay management and serves the stream as HLS (.m3u8) for playback in modern browsers.

## Features
✅ Play RTSP livestreams (converted to HLS for browser support)
✅ Basic playback controls (play, pause, volume)
✅ Overlay support (text & image) with custom position, size, and opacity
✅ CRUD API for overlay management (Create, Read, Update, Delete)
✅ Backend: Python (Flask) + MongoDB (optional)
✅ Streaming powered by FFmpeg
✅ Frontend: React (with hls.js)

## Teck Stack
Backend → Python (Flask)
Database → MongoDB (for overlay settings)
Frontend → React + Vite + hls.js
Streaming → FFmpeg (RTSP → HLS conversion)
Containerization → Docker & Docker Compose

## Prereqs
- Docker recommended (or Python 3.11, FFmpeg, Node 20)
- An RTSP URL (e.g., from your camera/NVR or a temporary RTSP source)


clone the Repository
``` bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```
build the docker image
```bash
docker build -t flask-ffmpeg-stream .
```
or
## Quick start (Docker)
```bash
docker-compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

Paste your RTSP URL in the input and click **Start**, then **Play**.

rtsp://rtspstream:F5uHUySRkNH21zdvDSE9A@zephyr.rtsp.stream/movie

rtsp://rtspstream:F5uHUySRkNH21zdvDSE9A@zephyr.rtsp.stream/pattern

rtsp://rtspstream:F5uHUySRkNH21zdvDSE9A@zephyr.rtsp.stream/people


## Local run (without Docker)

### Backend
```bash
cd backend
cp .env.example .env  # set RTSP_URL if you like
pip install -r requirements.txt
# Make sure FFmpeg is installed (ffmpeg --version)
python app.py
```

### Frontend
```bash
cd frontend
npm install
# Optionally set API base: export VITE_API=http://localhost:8000
npm run dev
```

## API (brief)
- `POST /api/stream/start` `{ "rtspUrl": "rtsp://..." }` → start FFmpeg
- `POST /api/stream/stop` → stop FFmpeg
- `GET  /api/stream/hls` → `{ "manifest": "/static/streams/main/index.m3u8" }`
- `GET  /api/overlays` → list overlays
- `POST /api/overlays` → create overlay
- `GET  /api/overlays/:id` → read
- `PUT  /api/overlays/:id` → update
- `DELETE /api/overlays/:id` → delete

## Notes
- HLS latency is ~4–8s. For lower latency consider LL-HLS or a WebRTC gateway.
- For production, serve `backend/static/` via Nginx for performance.
- This sample uses a fixed `userId: "demo"` for simplicity.
