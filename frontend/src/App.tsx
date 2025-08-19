import React, { useEffect, useState } from "react";
import Player from "./Player";
import OverlayEditor from "./OverlayEditor";
import { getManifest, startStream, stopStream, listOverlays, createOverlay, updateOverlay, deleteOverlay, getSettings } from "./api";

type Overlay = any;

export default function App() {
  const [manifest, setManifest] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [rtspUrl, setRtspUrl] = useState("");
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(res => setRtspUrl(res.data.rtspUrl || ""));
    getManifest().then(res => setManifest(res.data.manifest));
    refreshOverlays();
  }, []);

  const refreshOverlays = () => listOverlays().then(res => setOverlays(res.data));

  const start = async () => {
    await startStream(rtspUrl);
    const res = await getManifest();
    setManifest(res.data.manifest);
    setPlaying(true);
  };

  const stop = async () => {
    await stopStream();
    setPlaying(false);
  };

  const selected = overlays.find((o: any) => o._id === selectedOverlayId);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>Livestream Landing</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="RTSP URL (rtsp://...)"
          value={rtspUrl}
          onChange={e => setRtspUrl(e.target.value)}
        />
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
        <button onClick={() => setPlaying(p => !p)}>{playing ? "Pause" : "Play"}</button>
        <label>
          Muted <input type="checkbox" checked={muted} onChange={e => setMuted(e.target.checked)} />
        </label>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
      </div>

      <div style={{ position: "relative", width: "100%", background: "#111" }}>
        {manifest && (
          <>
            <Player src={`${(import.meta as any).env?.VITE_API || "http://localhost:8000"}${manifest}`} playing={playing} muted={muted} volume={volume} />
            <OverlayEditor
              elements={(selected?.elements || []).map((e: any, idx: number) => ({ id: String(idx), ...e }))}
              setElements={(els) => {
                if (!selected) return;
                const updated = { ...selected, elements: els.map(({id, ...rest}) => rest) };
                updateOverlay(selected._id, updated).then(refreshOverlays);
              }}
              editable={true}
            />
          </>
        )}
      </div>

      <h3 style={{ marginTop: 16 }}>Overlay Presets</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={async () => {
          const payload = {
            name: `Preset ${Date.now()}`,
            elements: [
              { type: "text", content: "LIVE", x: 20, y: 20, width: 120, height: 50, opacity: 0.95, style: { fontSize: 24, fontWeight: "bold", color: "#ff3333" } },
              { type: "image", content: "https://placehold.co/120x60?text=Logo", x: 20, y: 80, width: 120, height: 60, opacity: 1 }
            ]
          };
          await createOverlay(payload);
          refreshOverlays();
        }}>Create sample overlay</button>
      </div>

      <ul>
        {overlays.map((o: any) => (
          <li key={o._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setSelectedOverlayId(o._id)} style={{ fontWeight: selectedOverlayId === o._id ? 700 : 400 }}>
              {o.name}
            </button>
            <button onClick={() => { deleteOverlay(o._id).then(refreshOverlays); }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
