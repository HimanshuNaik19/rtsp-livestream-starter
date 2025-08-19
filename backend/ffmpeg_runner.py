import os, signal, subprocess, threading

class FFmpegRunner:
    def __init__(self, rtsp_url, out_dir):
        self.rtsp_url = rtsp_url
        self.out_dir = out_dir
        self.proc = None
        os.makedirs(out_dir, exist_ok=True)

    def start(self):
        if self.proc and self.proc.poll() is None:
            return  # already running
        if not self.rtsp_url:
            raise RuntimeError("No RTSP URL configured")
        cmd = [
            "ffmpeg", "-rtsp_transport", "tcp", "-i", self.rtsp_url,
            "-fflags", "+genpts", "-flags", "+global_header",
            "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency",
            "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
            "-c:a", "aac", "-ar", "44100", "-b:a", "128k",
            "-f", "hls", "-hls_time", "2", "-hls_list_size", "5", "-hls_flags", "delete_segments",
            os.path.join(self.out_dir, "index.m3u8"),
        ]
        # Start process
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        # Drain stderr in a daemon thread to avoid blocking
        t = threading.Thread(target=self._drain, daemon=True)
        t.start()

    def _drain(self):
        if self.proc and self.proc.stderr:
            for _ in iter(lambda: self.proc.stderr.readline(), b''):
                pass

    def stop(self):
        if self.proc and self.proc.poll() is None:
            try:
                self.proc.send_signal(signal.SIGINT)
                self.proc.wait(timeout=5)
            except Exception:
                self.proc.kill()

    def is_running(self):
        return self.proc and self.proc.poll() is None
