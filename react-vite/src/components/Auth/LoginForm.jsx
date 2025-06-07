import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLogin } from "../../store/sessionSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(thunkLogin(formData)).unwrap();
      toast.success(`Welcome back, ${res.user.username}! 👋`);
      setTimeout(() => navigate("/dashboard"), 300);
    } catch (err) {
      toast.error(err?.error || err?.errors?.email?.[0] || "Login failed");
    }
  };

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-80 mx-auto mt-20">
      <h2 className="text-xl mb-4 text-center font-semibold text-gray-700">Login</h2>

      {["email", "password"].map((field) => (
        <input
          key={field}
          name={field}
          type={field}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          className="mb-3 p-2 border w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoComplete={field === "password" ? "current-password" : "email"}
          required
        />
      ))}

      <button
        type="submit"
        disabled={formData.email.length < 4 || formData.password.length < 6}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
      >
        Login
      </button>
    </form>
  );
}
