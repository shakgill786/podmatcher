import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../store/axiosConfig";

export default function Inbox() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await axios.get("/messages");
        setThreads(data);
      } catch (err) {
        console.error("Error loading inbox:", err);
      }
    };
    fetchInbox();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📥 Inbox</h2>
      {threads.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <ul>
          {threads.map((t) => (
            <li key={t.user_id} className="border-b py-2">
              <Link
                to={`/messages/${t.user_id}`}
                className="flex justify-between items-center"
              >
                <div>
                  <strong>{t.username}</strong>
                  <p className="text-sm text-gray-600 truncate w-48">
                    {t.last_message}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(t.timestamp).toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
