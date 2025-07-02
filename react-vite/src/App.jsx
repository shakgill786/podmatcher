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
import { toast, Toaster } from "react-hot-toast";
import io from "socket.io-client";

import logo from "./assets/micmates-logo.png";
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

import axios from "./store/axiosConfig";
import {
  thunkAuthenticate,
  thunkLogout,
} from "./store/sessionSlice";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((s) => s.session.user);
  const [loaded, setLoaded]             = useState(false);
  const [globalUnread, setGlobalUnread] = useState(0);

  // 1️⃣ Restore session and fetch initial unread count
  useEffect(() => {
    dispatch(thunkAuthenticate())
      .then((action) => {
        if (action.type === "session/authenticate/fulfilled" && action.payload) {
          // only fetch unread if we’re logged in
          return axios.get("/messages/unread_count")
            .then(({ data }) => setGlobalUnread(data.unread_count))
            .catch(() => {});
        }
      })
      .finally(() => setLoaded(true));
  }, [dispatch]);

  // 2️⃣ Open socket for new_message + unread_count + browser push
  useEffect(() => {
    if (!user) return;

    // ask for permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("join", { room: String(user.id) });
    });

    socket.on("new_message", (msg) => {
      // toast banner
      toast.success(`New message from ${msg.from}`);
      // optional desktop push
      if (Notification.permission === "granted") {
        new Notification(`MicMates: ${msg.from}`, {
          body:
            msg.body.length > 50
              ? msg.body.slice(0, 50) + "…"
              : msg.body,
        });
      }
    });

    socket.on("unread_count", ({ unread_count }) => {
      // update header badge
      setGlobalUnread(unread_count);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!loaded) {
    return (
      <div className="container text-center">
        <p className="text-primary text-lg">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />

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
                <Link to="/inbox" className="relative">
                  Inbox
                  {globalUnread > 0 && (
                    <span className="
                      absolute -top-2 -right-4
                      bg-red-500 text-white text-xs
                      px-1 rounded-full
                    ">
                      {globalUnread}
                    </span>
                  )}
                </Link>
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

          <Route
            path="/edit-profile"
            element={
              user
                ? <EditProfile />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/users"
            element={
              user
                ? <UserDirectory />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/inbox"
            element={
              user
                ? <Inbox />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/messages/:userId"
            element={
              user
                ? <MessageThread />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/mates"
            element={
              user
                ? <MyMates />
                : <Navigate to="/login" replace />
            }
          />

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
