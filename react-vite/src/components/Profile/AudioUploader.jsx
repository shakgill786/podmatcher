// react-vite/src/components/Profile/AudioUploader.jsx

import { useState, useRef, useEffect } from "react";
import axios from "../../store/axiosConfig";
import { getCSRFToken } from "../../utils/csrf";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export default function AudioUploader({
  initialUrl,
  onUploadSuccess,
  onDeleteSuccess,
}) {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl]     = useState(initialUrl || null);
  const [mediaRecorder, setMR]    = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const chunksRef                 = useRef([]);

  // Wavesurfer refs
  const waveformRef  = useRef(null);
  const wavesurfer   = useRef(null);
  const [region, setRegion] = useState({ start: 0, end: 0 });

  // Sync when parent changes initialUrl
  useEffect(() => {
    setBlobUrl(initialUrl || null);
  }, [initialUrl]);

  // Initialize Wavesurfer whenever blobUrl changes
  useEffect(() => {
    if (!blobUrl) return;
    // Clean up old instance
    wavesurfer.current?.destroy();

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ddd",
      progressColor: "#4169E1",
      cursorColor: "#FF4081",
      height: 80,
      responsive: true,
      plugins: [
        RegionsPlugin.create(),
      ],
    });

    wavesurfer.current = ws;
    ws.load(blobUrl);

    ws.on("ready", () => {
      const duration = ws.getDuration();
      // default region = whole clip
      const reg = ws.addRegion({
        start: 0,
        end: duration,
        color: "rgba(255,64,129,0.3)",
        drag: true,
        resize: true,
      });
      setRegion({ start: 0, end: duration });
    });

    ws.on("region-updated", (reg) => {
      setRegion({ start: reg.start, end: reg.end });
    });

    return () => ws.destroy();
  }, [blobUrl]);

  // Recording handlers
  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url  = URL.createObjectURL(blob);
        setBlobUrl(url);
        chunksRef.current = [];
      };
      mr.start();
      setMR(mr);
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError("Mic unavailable or permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  // Utility to convert AudioBuffer → WAV blob
  const bufferToWaveBlob = (abuffer) => {
    const numCh = abuffer.numberOfChannels;
    const sampleRate = abuffer.sampleRate;
    const length = abuffer.length * numCh * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    let offset = 0;
    const writeString = (s) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset++, s.charCodeAt(i));
      }
    };
    writeString("RIFF");
    view.setUint32(offset, 36 + abuffer.length * numCh * 2, true); offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true); offset += 4;              // Subchunk1Size
    view.setUint16(offset, 1, true); offset += 2;               // PCM format
    view.setUint16(offset, numCh, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numCh * 2, true); offset += 4;
    view.setUint16(offset, numCh * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString("data");
    view.setUint32(offset, abuffer.length * numCh * 2, true); offset += 4;

    // Write PCM samples
    for (let i = 0; i < abuffer.length; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        let sample = abuffer.getChannelData(ch)[i];
        // clamp
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7FFF,
          true
        );
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  // Trim via OfflineAudioContext then upload
  const upload = async () => {
    setUploading(true);
    setError("");
    try {
      const ws = wavesurfer.current;
      const origBuffer = ws.backend.buffer;
      const { start, end } = region;
      const sr = origBuffer.sampleRate;
      const startSample = Math.floor(start * sr);
      const endSample   = Math.floor(end * sr);
      const frameCount  = endSample - startSample;

      // create trimmed AudioBuffer
      const offlineCtx = new OfflineAudioContext(
        origBuffer.numberOfChannels,
        frameCount,
        sr
      );
      const newBuf = offlineCtx.createBuffer(
        origBuffer.numberOfChannels,
        frameCount,
        sr
      );
      for (let c = 0; c < origBuffer.numberOfChannels; c++) {
        const channelData = origBuffer.getChannelData(c).slice(
          startSample,
          endSample
        );
        newBuf.copyToChannel(channelData, c, 0);
      }

      const renderedBuf = await offlineCtx.startRendering();
      const wavBlob = bufferToWaveBlob(renderedBuf);

      // send form data
      const form = new FormData();
      form.append("file", wavBlob, `snippet_${Date.now()}.wav`);
      const csrf = getCSRFToken();
      const res = await axios.post("/audio/upload", form, {
        headers: { "X-CSRFToken": csrf },
      });
      const publicUrl = `/static/audio_snippets/${res.data.filename}`;
      onUploadSuccess(publicUrl);
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteSnippet = async () => {
    setUploading(true);
    setError("");
    try {
      await axios.delete("/audio/upload", {
        headers: { "X-CSRFToken": getCSRFToken() },
      });
      setBlobUrl(null);
      onDeleteSuccess();
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {!blobUrl && !recording && (
          <button
            onClick={startRecording}
            className="btn btn-primary"
          >🎤 Record</button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="btn btn-outline"
          >⏹ Stop</button>
        )}
        {blobUrl && !uploading && (
          <>
            <button onClick={upload}      className="btn btn-primary">Upload</button>
            <button
              onClick={() => {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
              }}
              className="btn btn-outline"
            >Re-record</button>
            <button onClick={deleteSnippet} className="btn btn-danger">
              Delete
            </button>
          </>
        )}
        {uploading && <p>Uploading…</p>}
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* waveform + trimming UI */}
      {blobUrl && (
        <div>
          <div
            ref={waveformRef}
            className="w-full h-20 bg-gray-100 rounded mb-2"
          />
          <p className="text-sm text-gray-600">
            Trim from{" "}
            <strong>{region.start.toFixed(2)}s</strong> to{" "}
            <strong>{region.end.toFixed(2)}s</strong>
          </p>
        </div>
      )}
    </div>
  );
}
