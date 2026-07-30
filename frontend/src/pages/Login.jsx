import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white border border-forest-100 rounded-lg p-8">
      <h1 className="font-serif text-2xl mb-1">Welcome back</h1>
      <p className="text-sm text-ink/60 mb-6">Log in to book a study space.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
          />
        </label>

        {error && <p className="text-clay-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-forest-500 hover:bg-forest-600 text-white rounded py-2 font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4">
        No account?{" "}
        <Link to="/register" className="text-forest-500 font-medium">
          Sign up
        </Link>
      </p>

      <p className="text-xs text-ink/40 mt-6">
        Demo accounts (after running the seed script): admin@uni.ac.uk / sam@uni.ac.uk,
        password123
      </p>
    </div>
  );
}
