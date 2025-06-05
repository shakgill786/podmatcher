import { useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioUploader({ onUpload }) {
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState("");
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  const maxSizeMB = 2;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        if (blob.size / (1024 * 1024) > maxSizeMB) {
          setError("❌ File too large (max 2MB)");
          return;
        }

        setAudioBlob(blob);
        onUpload(new File([blob], "recorded_audio.webm"));
        loadWaveform(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setError("");
    } catch (err) {
      console.error("Mic error:", err);
      setError("Microphone permission denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("❌ Only audio files are allowed.");
      return;
    }

    if (file.size / (1024 * 1024) > maxSizeMB) {
      setError("❌ File too large (max 2MB).");
      return;
    }

    setAudioBlob(file);
    onUpload(file);
    loadWaveform(file);
    setError("");
  };

  const loadWaveform = (blob) => {
    if (!waveformRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#60a5fa",
      progressColor: "#1d4ed8",
      height: 60,
    });

    ws.loadBlob(blob);
    wavesurferRef.current = ws;
  };

  return (
    <div className="mb-4 border rounded-md p-4 bg-blue-50 shadow-sm">
      <label className="block font-bold mb-2 text-blue-800">🎙️ Intro Audio</label>

      <div className="flex items-center gap-4 mb-3">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            ⏹ Stop
          </button>
        )}

        <label className="cursor-pointer px-3 py-1 bg-gray-200 text-sm rounded">
          📁 Upload
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div ref={waveformRef} className="bg-gray-100 rounded-md overflow-hidden h-[60px]" />

      {audioBlob && (
        <div className="mt-2">
          <audio controls src={URL.createObjectURL(audioBlob)} />
        </div>
      )}
    </div>
  );
}
