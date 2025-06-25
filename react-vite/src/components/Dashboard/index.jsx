import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard({ user }) {
  return (
    <main className="hero">
      <div className="hero-card lg:flex lg:items-start lg:space-x-8">
        {/* ─── Left: Text Block ─────────────────────────── */}
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-indigo-600">{user.username}</span> 🎙️
          </h2>
          <p className="text-gray-700">
            This is your MicMates dashboard. What would you like to do today?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/edit-profile" className="btn btn-primary">
              ✏️ Edit Profile
            </Link>
            <Link to={`/profile/${user.id}`} className="btn btn-outline">
              👀 View Profile
            </Link>
            <Link to="/users" className="btn btn-primary">
              🔍 Browse Mates
            </Link>
            <Link to="/inbox" className="btn btn-outline">
              📥 Inbox
            </Link>
          </div>
        </div>

        {/* ─── Right: Clipped Illustration ───────────────────── */}
        <div className="dashboard-image-wrapper hidden lg:block lg:w-1/2">
          <img
            src="/landing-illustration.png"
            alt="Podcasters chatting illustration"
            className="dashboard-image"
          />
        </div>
      </div>
    </main>
  );
}
