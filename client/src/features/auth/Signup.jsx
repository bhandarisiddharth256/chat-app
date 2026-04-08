import { useState } from "react";
import { useAuthStore } from "./authStore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Signup;