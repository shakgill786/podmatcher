// react-vite/src/components/Dashboard/index.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard({ user }) {
  return (
    <main className="hero">
      <div className="hero-card lg:flex lg:items-center lg:justify-between lg:space-x-8 py-8">
        {/* Left side: Greeting & actions */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-4">
          <h2 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-indigo-600">{user.username}</span> 🎙️
          </h2>
          <p className="text-gray-700">
            This is your MicMates dashboard. What would you like to do today?
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 mt-4">
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

        {/* Right side: Illustration */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src="/landing-illustration.png"
            alt="Podcasters chatting illustration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </main>
  );
}
