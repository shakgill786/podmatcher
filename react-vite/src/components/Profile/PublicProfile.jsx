// react-vite/src/components/Profile/PublicProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import { toast } from "react-hot-toast";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const res = await axios.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleSendMessage = async () => {
    try {
      await axios.post("/messages", {
        recipient_id: profile.id,
        body: "Hey there! 👋 Let's connect!",
      });
      toast.success("Message sent!");
      navigate(`/messages/${userId}`);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  if (loading) return <div className="text-center mt-10 text-blue-600">Loading profile...</div>;
  if (!profile) return <div className="text-center mt-10 text-red-600">User not found</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        🎧 {profile.username}'s Public Profile
      </h1>

      <p className="mb-3"><strong>🧠 Bio:</strong> {profile.bio || "No bio yet."}</p>
      <p className="mb-3"><strong>🎯 Interests:</strong> {profile.interests || "No interests yet."}</p>
      <p className="mb-3"><strong>🎙️ Role:</strong> {profile.role}</p>
      <p className="mb-6"><strong>📚 Category:</strong> {profile.category || "N/A"}</p>

      {profile.audio_file ? (
        <div className="mb-6">
          <p className="font-semibold">🎧 Audio Preview:</p>
          <audio
            controls
            className="mt-2 w-full"
            src={`/static/audio_snippets/${profile.audio_file}`}
          />
        </div>
      ) : (
        <p className="italic text-gray-500 mb-6">
          🎵 No intro audio yet.
        </p>
      )}

      <button
        onClick={handleSendMessage}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow mb-4"
      >
        💬 Message this User
      </button>

      <div className="text-center">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
