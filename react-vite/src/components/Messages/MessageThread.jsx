import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../store/axiosConfig";

export default function MessageThread() {
  const { userId } = useParams();
  const [messages, setMessages]     = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/messages/${userId}`);
        setMessages(res.data);
        const userRes = await axios.get(`/users/${userId}`);
        setRecipient(userRes.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [userId]);

  const handleSend = async () => {
    const body = newMessage.trim();
    if (!body) return;
    try {
      const { data } = await axios.post("/messages", {
        recipient_id: parseInt(userId, 10),
        body,
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="hero">
      <div className="hero-card max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">
          💬 Chat with {recipient?.username || "User"}
        </h2>

        <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isIncoming = msg.from === recipient?.username;
              return (
                <div
                  key={msg.id}
                  className={`mb-3 p-2 rounded ${
                    isIncoming
                      ? "bg-gray-200 text-left"
                      : "bg-blue-200 text-right"
                  }`}
                >
                  <div className="text-sm">
                    <strong>{msg.from}</strong>: {msg.body}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="btn btn-primary px-4 py-2"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
