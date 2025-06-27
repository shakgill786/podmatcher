// react-vite/src/components/Users/MyMates.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../store/axiosConfig";

export default function MyMates() {
  const [mates, setMates] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/users/me/follows");
        setMates(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <main className="hero">
      <div className="hero-card">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          🤝 My Mates
        </h2>
        {mates.length === 0 ? (
          <p className="text-center">You’re not following anyone yet.</p>
        ) : (
          <div className="grid-users">
            {mates.map((u) => (
              <div key={u.id} className="card flex flex-col justify-between">
                <h3 className="text-xl font-semibold">{u.username}</h3>
                <p className="text-sm">{u.bio?.slice(0,80) || "No bio yet."}</p>
                <Link to={`/profile/${u.id}`} className="btn btn-outline">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
