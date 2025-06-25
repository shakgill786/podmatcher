import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { thunkLogin } from "../../store/sessionSlice";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((s) => s.session.user);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(thunkLogin(formData)).unwrap();
      toast.success(`Welcome back, ${res.username}!`);
      navigate("/dashboard");
    } catch {
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <main className="hero">
      <div className="hero-card max-w-sm w-full space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Welcome Back to MicMates
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded"
              required
            />
          </div>
          <div className="form-group">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={
              formData.email.length < 4 || formData.password.length < 6
            }
          >
            Log In
          </button>
        </form>
        <p className="text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="btn btn-outline inline-block">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
