from datetime import datetime

def overlay_document(user_id, name, elements):
    now = datetime.utcnow()
    return {
        "userId": user_id,             # string
        "name": name,                  # string
        "elements": elements,          # list of OverlayElement
        "createdAt": now,
        "updatedAt": now,
    }

# OverlayElement example:
# {
#   "type": "text" | "image",
#   "content": "Live" | "https://...logo.png",
#   "x": 120, "y": 40,
#   "width": 200, "height": 80,
#   "opacity": 0.9,
#   "style": { "fontSize": 24, "color": "#FFFFFF", "fontWeight": "bold" }
# }

def player_settings_document(user_id, rtsp_url, autoplay=False, muted=False):
    now = datetime.utcnow()
    return {
        "userId": user_id,
        "rtspUrl": rtsp_url,
        "autoplay": autoplay,
        "muted": muted,
        "createdAt": now,
        "updatedAt": now,
    }
