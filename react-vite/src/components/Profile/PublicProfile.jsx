import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../store/axiosConfig";
import { toast } from "react-hot-toast";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/users/${userId}`);
        setProfile(data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const sendMessage = async () => {
    try {
      await axios.post("/messages", {
        recipient_id: profile.id,
        body: "👋 Hey there!",
      });
      navigate(`/messages/${userId}`);
    } catch {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return <p className="container text-center py-8">Loading…</p>;
  }
  if (!profile) {
    return <p className="container text-center py-8 text-red-600">User not found</p>;
  }

  return (
    <div className="container py-8">
      <div className="card lg:flex lg:space-x-8">
        {/* Left: Info */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-indigo-600">
            🎧 {profile.username}'s Profile
          </h2>
          <p><strong>Bio:</strong> {profile.bio || "—"}</p>
          <p><strong>Interests:</strong> {profile.interests || "—"}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Category:</strong> {profile.category || "—"}</p>

          {profile.audio_url ? (
            <div className="mt-4">
              <label className="font-semibold">Intro Audio:</label>
              <audio
                controls
                src={profile.audio_url}
                className="w-full mt-2 rounded"
              />
            </div>
          ) : (
            <p className="italic text-gray-500">No intro audio yet.</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={sendMessage}
              className="btn btn-primary"
            >
              💬 Message
            </button>
            <Link to="/dashboard" className="btn btn-outline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="hidden lg:block lg:w-1/3">
          <img
            src="/landing-illustration.svg"
            alt="Podcasters chatting illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
