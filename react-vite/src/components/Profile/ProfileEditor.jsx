import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import AudioUploader from "./AudioUploader";
import { getCSRFToken } from "../../utils/csrf";
import { toast } from "react-hot-toast";

export default function ProfileEditor() {
  const [username,  setUsername]  = useState("");
  const [bio,       setBio]       = useState("");
  const [interests, setInterests] = useState("");
  const [category,  setCategory]  = useState("");
  const [role,      setRole]      = useState("");
  const [audioUrl,  setAudioUrl]  = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/users/me");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setInterests(data.interests || "");
        setCategory(data.category || "");
        setRole(data.role || "");
        setAudioUrl(data.audio_url || null);
      } catch {
        toast.error("Failed to load profile");
      }
    })();
  }, []);

  const handleAudioUpload = (url) => {
    setAudioUrl(url);
    toast.success("Audio uploaded");
  };
  const handleAudioDelete = () => {
    setAudioUrl(null);
    toast.success("Audio removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrf = getCSRFToken();
    try {
      await axios.put(
        "/users/me",
        { username, bio, interests, category, role },
        { headers: { "X-CSRFToken": csrf, "Content-Type": "application/json" } }
      );
      toast.success("Profile updated");
      navigate("/dashboard");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold text-center mb-6">✏️ Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label className="font-semibold">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />
        </div>

        <div className="form-group">
          <label className="font-semibold">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border p-3 rounded"
          />
        </div>

        <div className="form-group">
          <label className="font-semibold">Interests</label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full border p-3 rounded"
          />
        </div>

        <div className="form-group grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border p-3 rounded"
              required
            >
              <option value="">Select role</option>
              <option value="host">Host</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          <div>
            <label className="font-semibold">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-3 rounded"
            />
          </div>
        </div>

        <AudioUploader
          initialUrl={audioUrl}
          onUploadSuccess={handleAudioUpload}
          onDeleteSuccess={handleAudioDelete}
        />

        {audioUrl && (
          <div className="form-group">
            <label className="font-semibold">Preview Audio</label>
            <audio controls src={audioUrl} className="w-full rounded" />
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button type="submit" className="btn btn-primary px-6">
            Save Profile
          </button>
          <button
            type="button"
            className="btn btn-outline px-6"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
