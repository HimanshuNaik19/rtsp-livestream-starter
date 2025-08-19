import axios from "axios";
const baseURL = (import.meta as any).env?.VITE_API || "http://localhost:8000";
export const api = axios.create({ baseURL });

export const createOverlay = (payload: any) => api.post("/api/overlays", payload);
export const listOverlays = () => api.get("/api/overlays");
export const getOverlay  = (id: string) => api.get(`/api/overlays/${id}`);
export const updateOverlay = (id: string, payload: any) => api.put(`/api/overlays/${id}`, payload);
export const deleteOverlay = (id: string) => api.delete(`/api/overlays/${id}`);

export const startStream = (rtspUrl: string) => api.post("/api/stream/start", { rtspUrl });
export const stopStream  = () => api.post("/api/stream/stop");
export const getManifest = () => api.get("/api/stream/hls");
export const getSettings = () => api.get("/api/settings");
