import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";

import logo from "./assets/micmates-logo.png";
import LandingHero   from "./components/LandingHero";
import SignupForm    from "./components/Auth/SignupForm";
import LoginForm     from "./components/Auth/LoginForm";
import Dashboard     from "./components/Dashboard";
import EditProfile   from "./components/Profile/EditProfile";
import PublicProfile from "./components/Profile/PublicProfile";
import Inbox         from "./components/Messages/Inbox";
import MessageThread from "./components/Messages/MessageThread";
import UserDirectory from "./components/Users/UserDirectory";

import { thunkLogout, thunkAuthenticate } from "./store/sessionSlice";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((s) => s.session.user);
  const [loaded, setLoaded] = useState(false);

  // Restore session on mount
  useEffect(() => {
    dispatch(thunkAuthenticate()).finally(() => setLoaded(true));
  }, [dispatch]);

  if (!loaded) {
    return (
      <div className="container" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--color-primary)", fontSize: "1.25rem" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" />

      {/* ─── Header ─────────────────────────── */}
      <header>
        <div className="inner">
          <Link to={user ? "/dashboard" : "/"} className="logo">
            <img src={logo} alt="MicMates logo" />
            <div>
              <h1>MicMates</h1>
              <p className="tagline">MICS MATED, MOMENTS CREATED</p>
            </div>
          </Link>

          <nav>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/users">Browse</Link>
                <Link to="/inbox">Inbox</Link>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    dispatch(thunkLogout());
                    toast.success("Logged out");
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ─── Main Content ──────────────────── */}
      <main>
        <Routes>
          {/* root: show hero if not authed, otherwise dashboard */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to="/dashboard" replace />
                : <LandingHero />
            }
          />

          {/* public */}
          <Route path="/login"  element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* dashboard */}
          <Route
            path="/dashboard"
            element={
              user
                ? <Dashboard user={user} />
                : <Navigate to="/login" replace />
            }
          />

          {/* protected */}
          <Route path="/edit-profile"    element={user ? <EditProfile />   : <Navigate to="/login" />} />
          <Route path="/users"           element={user ? <UserDirectory />: <Navigate to="/login" />} />
          <Route path="/inbox"           element={user ? <Inbox />         : <Navigate to="/login" />} />
          <Route path="/messages/:userId" element={user ? <MessageThread /> : <Navigate to="/login" />} />

          {/* public profile */}
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ─── Footer ────────────────────────── */}
      <footer>
        <p>© {new Date().getFullYear()} MicMates</p>
      </footer>
    </div>
  );
}
