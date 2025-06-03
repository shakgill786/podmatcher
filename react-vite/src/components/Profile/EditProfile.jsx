import { useEffect, useState } from "react";
import axios from "../../store/axiosConfig";
import { toast } from "react-hot-toast";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    category: "",
    role: "host",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/me");
        setFormData(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/users/me", formData);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Your Profile</h2>
      {["username", "bio", "category", "role"].map((field) => (
        <input
          key={field}
          name={field}
          type="text"
          placeholder={field}
          value={formData[field] || ""}
          onChange={handleChange}
          className="mb-2 p-2 border w-full"
        />
      ))}
      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Save Changes
      </button>
    </form>
  );
}
