import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const linkClass = "hover:text-brass-400 transition-colors";

  return (
    <nav className="bg-forest-600 text-parchment px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-wide" onClick={() => setMenuOpen(false)}>
          Study space finder
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className={linkClass}>
            Browse spaces
          </Link>
          {user && (
            <Link to="/my-bookings" className={linkClass}>
              My bookings
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={linkClass}>
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
              <Link to="/login" className={linkClass}>
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

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm pb-1">
          <Link to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
            Browse spaces
          </Link>
          {user && (
            <Link to="/my-bookings" className={linkClass} onClick={() => setMenuOpen(false)}>
              My bookings
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin dashboard
            </Link>
          )}

          {user ? (
            <>
              <span className="text-forest-100">Signed in as {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-forest-700 hover:bg-forest-500 px-3 py-2 rounded transition-colors text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-brass-500 hover:bg-brass-600 text-ink px-3 py-2 rounded font-medium transition-colors inline-block w-fit"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
