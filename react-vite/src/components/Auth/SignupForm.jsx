import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../store/axiosConfig";
import { getCSRFToken } from "../../utils/csrf";
import { toast } from "react-hot-toast";

export default function SignupForm() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("guest");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = getCSRFToken();
    try {
      await axios.post(
        "/auth/signup",
        { email, username, password, role },
        { headers: { "X-CSRFToken": csrfToken } }
      );
      toast.success(`Welcome aboard, ${username}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <main className="hero">
      <div className="hero-card max-w-sm w-full space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Your MicMates Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded"
              required
            />
          </div>
          <div className="form-group">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              placeholder="Your handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-3 rounded"
              required
            />
          </div>
          <div className="form-group">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded"
              required
            />
          </div>
          <div className="form-group">
            <label className="block mb-1 font-semibold">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border p-3 rounded"
              required
            >
              <option value="host">Host</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Sign Up
          </button>
        </form>
        <p className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="btn btn-outline inline-block">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
