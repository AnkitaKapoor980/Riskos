import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(""); // Add error state for more specific error handling
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state
    setError(""); // Clear previous errors

    try {
      // Add Content-Type header for the POST request
      const response = await axios.post("http://localhost:5000/api/auth/register", form, {
        headers: {
          'Content-Type': 'application/json', // Ensures the data is sent as JSON
        },
      });

      if (response.status === 201) {
        navigate("/login"); // Redirect to login on success
      }
    } catch (err) {
      console.error("Signup error:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : "Signup failed.");
    } finally {
      setLoading(false); // Stop loading after request
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>} {/* Show error message */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Signing up..." : "Sign Up"} {/* Show loading text */}
        </button>
      </form>
    </div>
  );
};

export { SignupPage };
