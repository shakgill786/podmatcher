// src/components/Profile/AudioUploader.jsx

import React, { useState, useRef, useEffect } from "react";
import axios from "../../store/axiosConfig";
import { getCSRFToken } from "../../utils/csrf";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";

export default function AudioUploader({
  initialUrl,
  onUploadSuccess,
  onDeleteSuccess,
}) {
  const [blobUrl, setBlobUrl]     = useState(initialUrl || null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [region, setRegion]       = useState({ start: 0, end: 0 });

  const chunksRef   = useRef([]);
  const mediaRec    = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer  = useRef(null);

  useEffect(() => {
    setBlobUrl(initialUrl || null);
  }, [initialUrl]);

  useEffect(() => {
    if (!blobUrl) return;
    wavesurfer.current?.destroy();

    let ws;
    try {
      ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ddd",
        progressColor: "#4169E1",
        cursorColor: "#FF4081",
        height: 80,
        responsive: true,
        plugins: [RegionsPlugin.create()],
      });
      wavesurfer.current = ws;
      ws.load(blobUrl);

      ws.on("ready", () => {
        const dur = ws.getDuration();
        try {
          ws.addRegion({
            start: 0,
            end: dur,
            color: "rgba(255,64,129,0.3)",
            drag: true,
            resize: true,
          });
          setRegion({ start: 0, end: dur });
        } catch (e) {
          console.warn("⚠️ couldn’t add region:", e);
        }
      });

      ws.on("region-updated", (reg) => {
        setRegion({ start: reg.start, end: reg.end });
      });
    } catch (e) {
      console.warn("⚠️ Wavesurfer init error:", e);
    }

    return () => ws?.destroy();
  }, [blobUrl]);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setBlobUrl(URL.createObjectURL(blob));
      };
      mr.start();
      mediaRec.current = mr;
      setRecording(true);
    } catch (err) {
      console.error("🎙️ recording error:", err);
      setError("Mic unavailable or permission denied.");
    }
  };

  const stopRecording = () => {
    mediaRec.current?.stop();
    setRecording(false);
  };

  const handleReRecord = () => {
    wavesurfer.current?.destroy();
    URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setRegion({ start: 0, end: 0 });
  };

  const bufferToWaveBlob = (abuffer) => {
    const numCh = abuffer.numberOfChannels;
    const sr    = abuffer.sampleRate;
    const length = abuffer.length * numCh * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let offset = 0;
    const writeString = (s) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
    };
    writeString("RIFF");
    view.setUint32(offset, 36 + abuffer.length * numCh * 2, true); offset += 4;
    writeString("WAVEfmt ");
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numCh, true); offset += 2;
    view.setUint32(offset, sr, true); offset += 4;
    view.setUint32(offset, sr * numCh * 2, true); offset += 4;
    view.setUint16(offset, numCh * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString("data");
    view.setUint32(offset, abuffer.length * numCh * 2, true); offset += 4;
    for (let i = 0; i < abuffer.length; i++) {
      for (let c = 0; c < numCh; c++) {
        let sample = Math.max(-1, Math.min(1, abuffer.getChannelData(c)[i]));
        view.setInt16(offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7FFF,
          true
        );
        offset += 2;
      }
    }
    return new Blob([view], { type: "audio/wav" });
  };

  const upload = async () => {
    setUploading(true);
    setError("");
    try {
      let fileBlob;
      if (wavesurfer.current?.backend?.buffer) {
        const orig = wavesurfer.current.backend.buffer;
        const sr   = orig.sampleRate;
        const startS = Math.floor(region.start * sr);
        const endS   = Math.floor(region.end   * sr);
        const frameCount = endS - startS;
        const offlineCtx = new OfflineAudioContext(orig.numberOfChannels, frameCount, sr);
        const newBuf = offlineCtx.createBuffer(orig.numberOfChannels, frameCount, sr);
        for (let c = 0; c < orig.numberOfChannels; c++) {
          newBuf.copyToChannel(orig.getChannelData(c).slice(startS, endS), c, 0);
        }
        const rendered = await offlineCtx.startRendering();
        fileBlob = bufferToWaveBlob(rendered);
      } else {
        console.log("ℹ️ no buffer, uploading raw blob");
        fileBlob = await fetch(blobUrl).then(r => r.blob());
      }

      const form = new FormData();
      form.append("file", fileBlob, `snippet_${Date.now()}.wav`);
      const csrf = getCSRFToken();
      const { data } = await axios.post("/audio/upload", form, {
        headers: { "X-CSRFToken": csrf },
      });

      onUploadSuccess(`/static/audio_snippets/${data.filename}`);
    } catch (err) {
      console.error("🔴 upload error:", err);
      setError("Upload failed (check console)");
    } finally {
      setUploading(false);
    }
  };

  const deleteSnippet = async () => {
    setUploading(true);
    setError("");
    try {
      const csrf = getCSRFToken();
      await axios.delete("/audio/upload", {
        headers: { "X-CSRFToken": csrf },
      });
    } catch (err) {
      console.warn("🗑️ delete error (ok to ignore 404):", err);
    } finally {
      wavesurfer.current?.destroy();
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setRegion({ start: 0, end: 0 });
      onDeleteSuccess();
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {!blobUrl && !recording && (
          <button type="button" onClick={startRecording} className="btn btn-primary">
            🎤 Record
          </button>
        )}
        {recording && (
          <button type="button" onClick={stopRecording} className="btn btn-outline">
            ⏹ Stop
          </button>
        )}
        {blobUrl && !uploading && (
          <>
            <button type="button" onClick={upload}      className="btn btn-primary">
              Upload
            </button>
            <button type="button" onClick={handleReRecord} className="btn btn-outline">
              Re-record
            </button>
            <button type="button" onClick={deleteSnippet}  className="btn btn-outline">
              Delete
            </button>
          </>
        )}
        {uploading && <span>Uploading…</span>}
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {blobUrl && (
        <>
          <div ref={waveformRef} className="w-full h-20 bg-gray-100 rounded mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Trim from <strong>{region.start.toFixed(2)}s</strong> to <strong>{region.end.toFixed(2)}s</strong>
          </p>
          <audio controls src={blobUrl} className="w-full rounded mb-2" />
        </>
      )}
    </div>
  );
}
