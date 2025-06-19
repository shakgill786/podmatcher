// react-vite/src/components/Profile/ProfileEditor.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import AudioUploader from "./AudioUploader";
import { getCSRFToken } from "../../utils/csrf";
import { toast } from "react-hot-toast";

export default function ProfileEditor() {
  const [username, setUsername]   = useState("");
  const [bio, setBio]             = useState("");
  const [interests, setInterests] = useState("");
  const [category, setCategory]   = useState("");
  const [role, setRole]           = useState("");
  const [audioUrl, setAudioUrl]   = useState(null);
  const navigate = useNavigate();

  // 1️⃣ Load the profile (including the fully-qualified audio_url)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/users/me");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setInterests(data.interests || "");
        setCategory(data.category || "");
        setRole(data.role || "");
        // ← use the audio_url field your backend now sends
        setAudioUrl(data.audio_url || null);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        toast.error("Failed to load profile.");
      }
    })();
  }, []);

  // 2️⃣ Callbacks from the uploader
  const handleAudioUpload = (url) => {
    setAudioUrl(url);
    toast.success("Audio uploaded!");
  };
  const handleAudioDelete = () => {
    setAudioUrl(null);
    toast.success("Audio deleted.");
  };

  // 3️⃣ Save the rest of the profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrf = getCSRFToken();
      await axios.put(
        "/users/me",
        { username, bio, interests, category, role },
        { headers: { "X-CSRFToken": csrf, "Content-Type": "application/json" } }
      );
      toast.success("Profile updated!");
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Profile</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          ← Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Username, Bio, Interests, Role, Category */}
        {[
          { label: "Username", value: username, setter: setUsername, type: "text" },
          { label: "Bio",      value: bio,      setter: setBio,      type: "textarea" },
          { label: "Interests",value: interests,setter: setInterests,type: "textarea" },
        ].map(({ label, value, setter, type }) => (
          <div key={label} className="mb-4">
            <label className="block font-semibold">{label}</label>
            {type === "textarea" ? (
              <textarea
                value={value}
                onChange={e => setter(e.target.value)}
                className="border p-2 w-full"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={e => setter(e.target.value)}
                className="border p-2 w-full"
              />
            )}
          </div>
        ))}

        <div className="mb-4">
          <label className="block font-semibold">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select role</option>
            <option value="host">Host</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Category</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        {/* 4️⃣ Audio uploader always shows up */}
        <AudioUploader
          initialUrl={audioUrl}
          onUploadSuccess={handleAudioUpload}
          onDeleteSuccess={handleAudioDelete}
        />

        {/* 5️⃣ Preview if we have one */}
        {audioUrl && (
          <div className="mt-4">
            <p className="font-semibold">Preview:</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
