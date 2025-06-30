import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../store/axiosConfig";
import { toast } from "react-hot-toast";

export default function PublicProfile() {
  const { userId } = useParams();
  const me         = useSelector((s) => s.session.user);
  const [profile,  setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);

  // Load profile (including is_following & followers_count)
  useEffect(() => {
    setLoading(true);
    axios.get(`/users/${userId}`)
      .then(({ data }) => setProfile(data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  // Toggle follow / unfollow
  const toggleFollow = async () => {
    if (!profile) return;
    const action = profile.is_following ? "unfollow" : "follow";
    const method = profile.is_following ? "delete"     : "post";
    try {
      const { data } = await axios[method](`/users/${userId}/${action}`);
      // apply exactly what the server says
      setProfile(p => ({
        ...p,
        followers_count: data.followers_count,
        is_following:    data.is_following
      }));
      toast.success(
        data.is_following ? "Now following!" : "Unfollowed"
      );
    } catch {
      toast.error("Action failed");
    }
  };

  // Render states
  if (loading) return (
    <main className="hero">
      <div className="hero-card text-center">Loading…</div>
    </main>
  );
  if (!profile)  return (
    <main className="hero">
      <div className="hero-card text-center text-red-600">
        User not found
      </div>
    </main>
  );

  return (
    <main className="hero">
      <div className="hero-card lg:flex lg:space-x-8">
        {/* ─── Info ────────────────────────── */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-indigo-600">
            🎧 {profile.username}'s Profile
          </h2>
          <p><strong>Bio:</strong>       {profile.bio       || "—"}</p>
          <p><strong>Interests:</strong> {profile.interests || "—"}</p>
          <p><strong>Role:</strong>      {profile.role}</p>
          <p><strong>Category:</strong>  {profile.category   || "—"}</p>
          <p><strong>Followers:</strong> {profile.followers_count}</p>

          {/* only show on someone else’s profile */}
          {me?.id !== profile.id && (
            <button
              onClick={toggleFollow}
              className={`btn ${profile.is_following ? "btn-outline" : "btn-primary"}`}
            >
              {profile.is_following ? "Unfollow" : "Follow"}
            </button>
          )}

          <Link to="/dashboard" className="btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* ─── Illustration ────────────────── */}
        <div className="publicprofile-image-wrapper mt-6 lg:mt-0 lg:w-1/3">
          <img
            src="/landing-illustration.png"
            alt="Podcasters chatting illustration"
            className="publicprofile-image"
          />
        </div>
      </div>
    </main>
  );
}
