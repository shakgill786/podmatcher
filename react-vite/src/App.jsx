// src/App.jsx
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

import SignupForm from "./components/Auth/SignupForm";
import LoginForm from "./components/Auth/LoginForm";
import EditProfile from "./components/Profile/EditProfile";
import PublicProfile from "./components/Profile/PublicProfile";
import MessageThread from "./components/Messages/MessageThread";
import Inbox from "./components/Messages/Inbox";
import UserDirectory from "./components/Users/UserDirectory";

import { thunkLogout, thunkAuthenticate } from "./store/sessionSlice";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.session.user);
  const [loaded, setLoaded] = useState(false);

  // Try to restore session on mount
  useEffect(() => {
    dispatch(thunkAuthenticate()).finally(() => setLoaded(true));
  }, [dispatch]);

  // Global loading screen
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-pulse text-indigo-500 text-lg">
          Loading session…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100">
      <Toaster position="top-center" />

      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to={user ? "/dashboard" : "/"}
            className="text-2xl font-extrabold text-indigo-600"
          >
            🎧 PodMatcher
          </Link>
          <div className="space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/users"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Browse Users
                </Link>
                <Link
                  to="/inbox"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Inbox
                </Link>
                <button
                  onClick={() => {
                    dispatch(thunkLogout());
                    toast.success("👋 You’ve been logged out");
                    navigate("/login");
                  }}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome, {user.username} 🎤
                  </h1>
                  <p className="text-gray-600 mb-4">
                    This is your PodMatcher dashboard.
                  </p>
                  <div className="mt-6 space-y-2">
                    <Link
                      to="/edit-profile"
                      className="block text-indigo-600 hover:underline"
                    >
                      ✏️ Edit Profile
                    </Link>
                    <Link
                      to={`/profile/${user.id}`}
                      className="block text-green-600 hover:underline"
                    >
                      👀 View Public Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/edit-profile"
            element={user ? <EditProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={user ? <UserDirectory /> : <Navigate to="/login" />}
          />
          <Route
            path="/inbox"
            element={user ? <Inbox /> : <Navigate to="/login" />}
          />
          <Route
            path="/messages/:userId"
            element={user ? <MessageThread /> : <Navigate to="/login" />}
          />
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-gray-500">
        © {new Date().getFullYear()} PodMatcher
      </footer>
    </div>
  );
}
