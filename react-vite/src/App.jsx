import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

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
  const user = useSelector((state) => state.session.user);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(thunkAuthenticate()).finally(() => setLoaded(true));
  }, [dispatch]);

  if (!loaded) return <div className="text-center mt-10">Loading session...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-xl font-bold text-indigo-700"
        >
          🎧 PodMatcher
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
              <Link to="/users" className="text-blue-600 hover:underline">
                Browse Users
              </Link>
              <Link to="/inbox" className="text-blue-600 hover:underline">
                Inbox
              </Link>
              <button
                onClick={() => {
                  dispatch(thunkLogout());
                  toast.success("👋 You've been logged out");
                  navigate("/login");
                }}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4 flex items-center justify-center">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2">Welcome, {user.username} 🎤</h1>
                  <p className="mb-4">This is your PodMatcher dashboard.</p>
                  <div className="mt-4 space-y-2">
                    <Link to="/edit-profile" className="block underline text-blue-600">
                      ✏️ Edit Your Profile
                    </Link>
                    <Link to={`/profile/${user.id}`} className="block underline text-green-600">
                      👀 View Your Public Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/inbox" element={user ? <Inbox /> : <Navigate to="/login" />} />
          <Route path="/messages/:userId" element={user ? <MessageThread /> : <Navigate to="/login" />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/users" element={user ? <UserDirectory /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
);
}
