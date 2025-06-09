import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig"; // ✅ import your configured axios instance

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/users/${userId}`); // ✅ axios handles baseURL + cookies
        setUser(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSendMessage = async () => {
    try {
      await axios.post("/messages", {
        receiver_id: user.id,
        content: "Hey there! 👋 Let's connect!",
      });
      navigate(`/messages/${userId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("❌ Failed to send message.");
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-blue-600">Loading profile...</div>;

  if (!user)
    return <div className="text-center mt-10 text-red-600">User not found</div>;

  return (
    <div className="max-w-xl w-full mx-auto mt-10 p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        🎧 {user.username}'s Public PodMatcher Profile
      </h1>

      <p className="mb-3"><strong>🧠 Bio:</strong> {user.bio || "No bio yet."}</p>
      <p className="mb-3"><strong>🎯 Interests:</strong> {user.interests || "No interests added."}</p>
      <p className="mb-3"><strong>🎙️ Role:</strong> {user.role}</p>
      <p className="mb-6"><strong>📚 Category:</strong> {user.category || "N/A"}</p>

      {user.audio_file ? (
        <div className="mb-6">
          <p className="font-semibold">🎧 Audio Preview:</p>
          <audio controls src={`/static/audio_snippets/${user.audio_file}`} className="mt-2 w-full" />
        </div>
      ) : (
        <p className="italic text-gray-500 mb-6">
          🎵 No intro audio yet. Maybe they’re shy... or just mysterious!
        </p>
      )}

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow mb-4"
        onClick={handleSendMessage}
      >
        💬 Message this User
      </button>

      <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700">
        <p>🏅 Badges: <em>Coming soon</em></p>
        <p>👥 Followers: <em>0</em></p>
        <p>📅 Schedule: <em>Calendar feature coming soon!</em></p>
      </div>

      <div className="text-center mt-6">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
