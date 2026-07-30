import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white border border-forest-100 rounded-lg p-8">
      <h1 className="font-serif text-2xl mb-1">Create your account</h1>
      <p className="text-sm text-ink/60 mb-6">Sign up to start booking study spaces.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium">
          Full name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
          />
        </label>
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
            minLength={6}
            className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
          />
        </label>

        {error && <p className="text-clay-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-forest-500 hover:bg-forest-600 text-white rounded py-2 font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-forest-500 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
