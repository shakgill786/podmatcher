// react-vite/src/components/Profile/PublicProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../store/axiosConfig";
import { toast } from "react-hot-toast";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);

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

  const toggleFollow = async () => {
    try {
      const method = profile.is_following ? "delete" : "post";
      const { data } = await axios[method](`/users/${userId}/follow`);
      setProfile({
        ...profile,
        followers_count: data.followers_count,
        is_following:    data.is_following
      });
      toast.success(
        profile.is_following 
          ? "Unfollowed" 
          : "Now following!"
      );
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!profile) return <p className="text-red-600">User not found</p>;

  return (
    <main className="hero">
      <div className="hero-card lg:flex lg:space-x-8">
        {/* … info block … */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-indigo-600">
            🎧 {profile.username}'s Profile
          </h2>
          <p><strong>Followers:</strong> {profile.followers_count}</p>
          {/* … other fields … */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={toggleFollow}
              className={`btn ${
                profile.is_following ? "btn-outline" : "btn-primary"
              }`}
            >
              {profile.is_following ? "Unfollow" : "Follow"}
            </button>
            <Link to="/dashboard" className="btn btn-outline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        {/* … illustration … */}
      </div>
    </main>
  );
}
