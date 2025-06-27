import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "../../store/axiosConfig";

export default function MessageThread() {
  const { userId } = useParams();
  const me         = useSelector((s) => s.session.user);
  const [messages, setMessages]     = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient]   = useState(null);
  const [isTyping, setIsTyping]     = useState(false);

  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const socketRef   = useRef();

  // 1️⃣ Connect & join our room
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", { withCredentials: true });
    socketRef.current.on("connect", () => {
      console.log("⚡ socket connected");
      socketRef.current.emit("join", { room: String(me.id) });
    });
    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socketRef.current.on("typing", () => {
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 1500);
    });
    return () => socketRef.current.disconnect();
  }, [me.id]);

  // 2️⃣ Load history & join partner’s room
  useEffect(() => {
    (async () => {
      try {
        const [{ data: thread }, { data: user }] = await Promise.all([
          axios.get(`/messages/${userId}`),
          axios.get(`/users/${userId}`),
        ]);
        setMessages(thread);
        setRecipient(user);
        socketRef.current.emit("join", { room: String(user.id) });
      } catch (err) {
        console.error("Error loading chat:", err);
      }
    })();
  }, [userId]);

  // 3️⃣ Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Typing indicator
  const handleInput = (e) => {
    setNewMessage(e.target.value);
    socketRef.current.emit("typing", { to: Number(userId) });
    clearTimeout(typingTimer.current);
    setIsTyping(true);
    typingTimer.current = setTimeout(() => setIsTyping(false), 1500);
  };

  // 5️⃣ Send — **no** optimistic setMessages
  const handleSend = async () => {
    const body = newMessage.trim();
    if (!body) return;
    try {
      await axios.post("/messages", {
        recipient_id: parseInt(userId, 10),
        body,
      });
      setNewMessage("");
      setIsTyping(false);
      // socket broadcast will append it once
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

        <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border mb-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isIncoming = msg.sender_id === recipient?.id;
              return (
                <div
                  key={msg.id}
                  className={`mb-3 p-2 rounded ${
                    isIncoming ? "bg-gray-200 text-left" : "bg-blue-200 text-right"
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
          <div ref={bottomRef} />
        </div>

        {isTyping && (
          <p className="text-sm text-gray-500 italic mb-2">
            💬 Someone is typing…
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInput}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn btn-primary px-4 py-2" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
