import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function MessageThread() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);

  // Load message history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    const loadRecipient = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setRecipient(data);
        }
      } catch (err) {
        console.error("Error loading recipient:", err);
      }
    };

    loadMessages();
    loadRecipient();
  }, [userId]);

  // Handle sending message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        "/api/messages",
        {
          receiver_id: parseInt(userId),
          content: newMessage.trim(),
        },
        { withCredentials: true }
      );

      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white/80 backdrop-blur-lg rounded-xl border shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        💬 Chat with {recipient?.username || "User"}
      </h2>

      <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 p-2 rounded ${
                msg.from === recipient?.username
                  ? "bg-gray-200 text-left"
                  : "bg-blue-200 text-right"
              }`}
            >
              <div className="text-sm">
                <strong>{msg.from}</strong>: {msg.content}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
