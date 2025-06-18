// react-vite/src/components/Users/UserDirectory.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersThunk } from "../../store/usersSlice";
import { Link } from "react-router-dom";

export default function UserDirectory() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        🔍 Browse PodMatchers
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No other users yet.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">{u.username}</h2>
              <p><strong>🎙 Role:</strong> {u.role}</p>
              <p><strong>📚 Category:</strong> {u.category || "N/A"}</p>
              <p className="text-gray-700 mt-2">
                {u.bio?.slice(0, 80)}...
              </p>

              {u.audio_file && (
                <audio
                  controls
                  src={`/static/audio_snippets/${u.audio_file}`}
                  className="mt-2 w-full"
                />
              )}

              <div className="mt-4 space-x-3">
                <Link
                  to={`/profile/${u.id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  👀 View Profile
                </Link>
                <Link
                  to={`/messages/${u.id}`}
                  className="text-green-600 hover:underline font-semibold"
                >
                  💬 Message
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
