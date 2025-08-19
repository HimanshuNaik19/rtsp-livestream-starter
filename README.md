# RTSP Livestream Starter (Flask + Mongo + React)

This starter lets browsers watch an RTSP livestream by transcoding it to HLS with FFmpeg. It includes:
- Flask API + MongoDB for overlay CRUD and settings
- FFmpeg runner to convert RTSP → HLS (`.m3u8` + `.ts`)
- React landing page using `hls.js` with a drag-resize overlay editor

## Prereqs
- Docker recommended (or Python 3.11, FFmpeg, Node 20)
- An RTSP URL (e.g., from your camera/NVR or a temporary RTSP source)

## Quick start (Docker)
```bash
docker-compose up --build
```
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

Paste your RTSP URL in the input and click **Start**, then **Play**.

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
