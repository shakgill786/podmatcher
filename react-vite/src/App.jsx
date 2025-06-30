// react-vite/src/App.jsx

import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster }           from "react-hot-toast";

import logo           from "./assets/micmates-logo.png";
import LandingHero    from "./components/LandingHero";
import SignupForm     from "./components/Auth/SignupForm";
import LoginForm      from "./components/Auth/LoginForm";
import Dashboard      from "./components/Dashboard";
import EditProfile    from "./components/Profile/EditProfile";
import PublicProfile  from "./components/Profile/PublicProfile";
import Inbox          from "./components/Messages/Inbox";
import MessageThread  from "./components/Messages/MessageThread";
import UserDirectory  from "./components/Users/UserDirectory";
import MyMates        from "./components/Users/MyMates";

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
      <div className="container text-center">
        <p className="text-primary text-lg">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" />

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
                <Link to="/mates">My Mates</Link>
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

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              user
                ? <Navigate to="/dashboard" replace />
                : <LandingHero />
            }
          />

          <Route path="/login"  element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          <Route
            path="/dashboard"
            element={
              user
                ? <Dashboard user={user} />
                : <Navigate to="/login" replace />
            }
          />

          <Route path="/edit-profile"     element={user ? <EditProfile />   : <Navigate to="/login" />} />
          <Route path="/users"            element={user ? <UserDirectory /> : <Navigate to="/login" />} />
          <Route path="/inbox"            element={user ? <Inbox />         : <Navigate to="/login" />} />
          <Route path="/messages/:userId" element={user ? <MessageThread /> : <Navigate to="/login" />} />
          <Route path="/mates"            element={user ? <MyMates />       : <Navigate to="/login" />} />

          <Route path="/profile/:userId" element={<PublicProfile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} MicMates</p>
      </footer>
    </div>
  );
}
