import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from ffmpeg_runner import FFmpegRunner
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB", "rtsp_app")
STREAM_DIR = os.path.join(os.path.dirname(__file__), os.getenv("STREAM_DIR", "static/streams/main"))
DEFAULT_RTSP = os.getenv("RTSP_URL", "")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
overlays = db["overlays"]
settings = db["player_settings"]

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

runner = FFmpegRunner(DEFAULT_RTSP, STREAM_DIR)

def oid(obj):
    obj["_id"] = str(obj["_id"])
    return obj

@app.route("/api/health")
def health():
    return {"ok": True, "ffmpeg": runner.is_running()}

# --- Stream control ---
@app.post("/api/stream/start")
def start_stream():
    data = request.get_json(force=True, silent=True) or {}
    rtsp = data.get("rtspUrl") or DEFAULT_RTSP
    if not rtsp:
        return {"error": "rtspUrl required"}, 400
    # Upsert settings for demo user
    settings.update_one({"userId": "demo"}, {"$set": {
        "rtspUrl": rtsp, "updatedAt": datetime.utcnow()
    }}, upsert=True)
    runner.rtsp_url = rtsp
    try:
        runner.start()
    except Exception as e:
        return {"error": str(e)}, 400
    return {"ok": True, "running": runner.is_running()}

@app.post("/api/stream/stop")
def stop_stream():
    runner.stop()
    return {"ok": True, "running": runner.is_running()}

@app.get("/api/stream/hls")
def get_hls_manifest():
    rel = "streams/main/index.m3u8"
    return {"manifest": f"/static/{rel}"}

# --- Overlays CRUD ---
@app.post("/api/overlays")
def create_overlay():
    body = request.get_json(force=True) or {}
    body["userId"] = body.get("userId", "demo")
    now = datetime.utcnow()
    body["createdAt"] = now; body["updatedAt"] = now
    res = overlays.insert_one(body)
    return {"_id": str(res.inserted_id)}, 201

@app.get("/api/overlays")
def list_overlays():
    user_id = request.args.get("userId", "demo")
    docs = [oid(o) for o in overlays.find({"userId": user_id}).sort("updatedAt", -1)]
    return jsonify(docs)

@app.get("/api/overlays/<overlay_id>")
def get_overlay(overlay_id):
    try:
        doc = overlays.find_one({"_id": ObjectId(overlay_id)})
    except Exception:
        return {"error": "invalid id"}, 400
    if not doc: return {"error": "not found"}, 404
    return jsonify(oid(doc))

@app.put("/api/overlays/<overlay_id>")
def update_overlay(overlay_id):
    body = request.get_json(force=True) or {}
    body["updatedAt"] = datetime.utcnow()
    try:
        res = overlays.update_one({"_id": ObjectId(overlay_id)}, {"$set": body})
    except Exception:
        return {"error": "invalid id"}, 400
    if res.matched_count == 0: return {"error": "not found"}, 404
    doc = overlays.find_one({"_id": ObjectId(overlay_id)})
    return jsonify(oid(doc))

@app.delete("/api/overlays/<overlay_id>")
def delete_overlay(overlay_id):
    try:
        res = overlays.delete_one({"_id": ObjectId(overlay_id)})
    except Exception:
        return {"error": "invalid id"}, 400
    if res.deleted_count == 0: return {"error": "not found"}, 404
    return {"ok": True}

# --- Player settings ---
@app.get("/api/settings")
def get_settings():
    doc = settings.find_one({"userId": "demo"})
    if not doc:
        return {"userId": "demo", "rtspUrl": DEFAULT_RTSP, "autoplay": False, "muted": False}
    return jsonify(oid(doc))

if __name__ == "__main__":
    os.makedirs(STREAM_DIR, exist_ok=True)
    app.run(host="0.0.0.0", port=8000, debug=True)
