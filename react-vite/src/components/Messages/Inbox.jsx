import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../store/axiosConfig";

export default function Inbox() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/messages");
        setThreads(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <main className="hero">
      <div className="hero-card">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Inbox</h2>
        {threads.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul className="inbox-list">
            {threads.map((t) => (
              <li key={t.user_id}>
                <Link to={`/messages/${t.user_id}`}>
                  <span className="username">{t.username}</span>
                  <span className="preview">{t.last_message}</span>
                  <span className="time">
                    {new Date(t.timestamp).toLocaleString()}
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
