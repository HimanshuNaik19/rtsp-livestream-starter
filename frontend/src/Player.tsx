import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  playing: boolean;
  muted: boolean;
  volume: number;
};

export default function Player({ src, playing, muted, volume }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current!;
    if (!src) return;
    if (Hls.isSupported()) {
      const hls = new Hls({ liveDurationInfinity: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (playing) video.play().catch(() => {});
      });
      return () => { hls.destroy(); };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }, [src]);

  useEffect(() => {
    const v = videoRef.current!;
    v.muted = muted;
    v.volume = volume;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, muted, volume]);

  return (
    <video
      ref={videoRef}
      playsInline
      controls={false}
      style={{ width: "100%", height: "auto", background: "#000" }}
    />
  );
}
