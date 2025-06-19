// react-vite/src/components/Profile/AudioUploader.jsx

import { useState, useRef, useEffect } from "react";
import axios from "../../store/axiosConfig";
import { getCSRFToken } from "../../utils/csrf";

export default function AudioUploader({
  initialUrl,
  onUploadSuccess,
  onDeleteSuccess,
}) {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState(initialUrl || null);
  const [mediaRecorder, setMR] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const chunksRef = useRef([]);

  // 🔄 Sync internal blobUrl whenever the parent-provided URL changes
  useEffect(() => {
    setBlobUrl(initialUrl || null);
  }, [initialUrl]);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        chunksRef.current = [];
      };
      mr.start();
      setMR(mr);
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      setError("Microphone unavailable or permission denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const upload = async () => {
    setUploading(true);
    setError("");
    try {
      // grab the blob back out of the URL
      const blob = await fetch(blobUrl).then((r) => r.blob());
      const form = new FormData();
      form.append("file", blob, "snippet.webm");

      const csrf = getCSRFToken();
      const res = await axios.post("/audio/upload", form, {
        headers: { "X-CSRFToken": csrf },
      });

      const publicUrl = `/static/audio_snippets/${res.data.filename}`;
      onUploadSuccess(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
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

      // clear local and parent state
      setBlobUrl(null);
      onDeleteSuccess();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {!blobUrl && !recording && (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            🎤 Record
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            ⏹ Stop
          </button>
        )}
        {blobUrl && !uploading && (
          <>
            <button
              onClick={upload}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Upload
            </button>
            <button
              onClick={() => {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Re-record
            </button>
            <button
              onClick={deleteSnippet}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Delete
            </button>
          </>
        )}
        {uploading && (
          <div className="flex items-center">
            <div className="loader mr-2" />
            Uploading…
          </div>
        )}
      </div>

      {blobUrl && (
        <div className="mt-2">
          <audio controls src={blobUrl} className="w-full" />
        </div>
      )}

      {error && <p className="text-red-600 mt-1">{error}</p>}

      {/* spinner CSS */}
      <style>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 
          0% { transform: rotate(0); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
