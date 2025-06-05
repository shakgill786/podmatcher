import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import SignupForm from './components/Auth/SignupForm';
import LoginForm from './components/Auth/LoginForm';
import EditProfile from './components/Profile/EditProfile';
import PublicProfile from './components/Profile/PublicProfile';
import MessageThread from './components/Messages/MessageThread';
import { thunkLogout, thunkAuthenticate } from './store/sessionSlice';
import { toast } from 'react-hot-toast';

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(thunkAuthenticate()).finally(() => setLoaded(true));
  }, [dispatch]);

  if (!loaded) return <div className="text-center mt-10">Loading session...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Routes>
        {/* Root Redirect */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />

        {/* Public Auth Routes */}
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.username} 🎤</h1>
                <p className="mb-4">This is your PodMatcher dashboard.</p>

                <button
                  onClick={() => {
                    dispatch(thunkLogout());
                    toast.success("You’ve been logged out. See ya! 👋");
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>

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

        {/* Profile Editor */}
        <Route
          path="/edit-profile"
          element={user ? <EditProfile /> : <Navigate to="/login" />}
        />

        {/* Message Thread */}
        <Route
          path="/messages/:userId"
          element={user ? <MessageThread /> : <Navigate to="/login" />}
        />

        {/* Public Profile */}
        <Route path="/profile/:userId" element={<PublicProfile />} />
      </Routes>
    </div>
  );
}
