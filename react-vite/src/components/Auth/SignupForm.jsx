import { useState } from "react";
import { useDispatch } from "react-redux";
/*import { thunkSignup } from "../../store/sessionSlice"*/
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function SignupForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "host",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(thunkSignup(formData)).unwrap();
      toast.success(`Welcome, ${res.user}! 🎉`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.error || err?.errors?.email?.[0] || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-80">
      <h2 className="text-xl mb-4 text-center">Sign Up</h2>
      {["username", "email", "password", "role"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "password" ? "password" : "text"}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          className="mb-2 p-2 border w-full"
        />
      ))}
      <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Sign Up
      </button>
    </form>
  );
}
