import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-forest-600 text-parchment px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-serif text-xl tracking-wide">
        Study space finder
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/" className="hover:text-brass-400 transition-colors">
          Browse spaces
        </Link>
        {user && (
          <Link to="/my-bookings" className="hover:text-brass-400 transition-colors">
            My bookings
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" className="hover:text-brass-400 transition-colors">
            Admin dashboard
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-forest-100">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-forest-700 hover:bg-forest-500 px-3 py-1.5 rounded transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-brass-400 transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-brass-500 hover:bg-brass-600 text-ink px-3 py-1.5 rounded font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
