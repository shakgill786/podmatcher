import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../store/axiosConfig";
import io from "socket.io-client";

export default function Inbox() {
  const me = useSelector((s) => s.session.user);
  const [threads, setThreads]   = useState([]);
  const [sortMode, setSortMode] = useState("unread"); // "unread" or "recent"

  const fetchThreads = async () => {
    try {
      const { data } = await axios.get("/messages");
      setThreads(data);
    } catch (err) {
      console.error("Failed to load inbox:", err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // subscribe to server-side unread_count events
  useEffect(() => {
    if (!me) return;
    const socket = io("http://localhost:5000", { withCredentials: true });
    socket.on("connect", () => {
      socket.emit("join", { room: String(me.id) });
    });
    socket.on("unread_count", () => {
      // some message’s unread changed → re-fetch threads
      fetchThreads();
    });
    return () => socket.disconnect();
  }, [me]);

  // sort “unread first” or “most recent”
  const displayed = [...threads].sort((a, b) => {
    if (sortMode === "unread") {
      const au = a.unread_count > 0;
      const bu = b.unread_count > 0;
      if (au !== bu) return bu ? 1 : -1;
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <main className="hero">
      <div className="hero-card">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Inbox</h2>

        <div className="mb-4 flex gap-2">
          <button
            className={`btn btn-outline ${sortMode === "unread" ? "bg-indigo-100" : ""}`}
            onClick={() => setSortMode("unread")}
          >
            Unread First
          </button>
          <button
            className={`btn btn-outline ${sortMode === "recent" ? "bg-indigo-100" : ""}`}
            onClick={() => setSortMode("recent")}
          >
            Most Recent
          </button>
        </div>

        {displayed.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul className="inbox-list">
            {displayed.map((t) => (
              <li key={t.user_id}>
                <Link to={`/messages/${t.user_id}`} className="flex items-center">
                  <span className="username font-semibold">{t.username}</span>
                  {t.unread_count > 0 && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {t.unread_count}
                    </span>
                  )}
                  <span className="preview mx-4 flex-1">{t.last_message}</span>
                  <span className="time text-sm text-gray-500">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
