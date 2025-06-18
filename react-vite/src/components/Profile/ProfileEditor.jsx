import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import AudioUploader from "./AudioUploader";
import { getCSRFToken } from "../../utils/csrf";
import { toast } from "react-hot-toast";

export default function ProfileEditor() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axios.get("/users/me");
        const data = res.data;
        setUsername(data.username || "");
        setBio(data.bio || "");
        setInterests(data.interests || "");
        setCategory(data.category || "");
        setRole(data.role || "");
        if (data.audio_file) {
          setAudioUrl(`/static/audio_snippets/${data.audio_file}`);
        }
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        toast.error("Failed to load profile.");
      }
    };
    loadProfile();
  }, []);

  const handleAudioUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/audio/upload", formData);
      setAudioUrl(`/static/audio_snippets/${res.data.filename}`);
    } catch (err) {
      console.error("❌ Audio upload failed:", err);
      toast.error("Audio upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = getCSRFToken();
    const payload = { username, bio, interests, category, role };

    try {
      await axios.put("/users/me", payload, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
      toast.success("✅ Profile updated!");
    } catch (err) {
      console.error("❌ Failed to update profile:", err.response?.data || err.message);
      toast.error("❌ Failed to save changes.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Your Profile</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
        >
          🔙 Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block font-semibold">Username</label>
        <input type="text" className="border p-2 w-full mb-4" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label className="block font-semibold">Bio</label>
        <textarea className="border p-2 w-full mb-4" value={bio} onChange={(e) => setBio(e.target.value)} />

        <label className="block font-semibold">Interests</label>
        <textarea className="border p-2 w-full mb-4" value={interests} onChange={(e) => setInterests(e.target.value)} />

        <label className="block font-semibold">Role</label>
        <select className="border p-2 w-full mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select role</option>
          <option value="host">Host</option>
          <option value="guest">Guest</option>
        </select>

        <label className="block font-semibold">Category</label>
        <input type="text" className="border p-2 w-full mb-4" value={category} onChange={(e) => setCategory(e.target.value)} />

        <AudioUploader onUpload={handleAudioUpload} />

        {audioUrl && (
          <div className="mt-4">
            <p className="font-semibold mb-1">🎧 Preview Audio Snippet:</p>
            <audio controls src={audioUrl}></audio>
          </div>
        )}

        <button type="submit" className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
          Save Profile
        </button>
      </form>
    </div>
  );
}
