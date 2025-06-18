import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import { getCSRFToken } from "../../utils/csrf";
import { toast } from "react-hot-toast";

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = getCSRFToken();

    try {
      const res = await axios.post(
        "/auth/signup",
        { email, username, password, role },
        { headers: { "X-CSRFToken": csrfToken } }
      );
      toast.success(`🎉 Welcome, ${res.data.user.username}! Your account is ready.`);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      console.error("Signup failed", err);
      toast.error(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-xl font-bold mb-4">Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input className="w-full border p-2 mb-4" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Username</label>
        <input className="w-full border p-2 mb-4" value={username} onChange={e => setUsername(e.target.value)} />

        <label>Password</label>
        <input type="password" className="w-full border p-2 mb-4" value={password} onChange={e => setPassword(e.target.value)} />

        <label>Role</label>
        <select className="w-full border p-2 mb-4" value={role} onChange={e => setRole(e.target.value)}>
          <option value="host">Host</option>
          <option value="guest">Guest</option>
        </select>

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  );
}
