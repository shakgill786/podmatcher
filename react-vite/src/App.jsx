import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import SignupForm from './components/Auth/SignupForm';
import LoginForm from './components/Auth/LoginForm';
import EditProfile from './components/Profile/EditProfile';
import { thunkLogout, thunkAuthenticate } from './store/sessionSlice';
import { toast } from 'react-hot-toast';

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(thunkAuthenticate()).finally(() => setLoaded(true));
  }, [dispatch]);

  if (!loaded) return <div className="text-center">Loading session...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Routes>
        {/* Root redirects */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />

        {/* Public Routes */}
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user} 🎤</h1>
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
                <div className="mt-4">
                  <a href="/edit-profile" className="underline text-blue-600">
                    Edit Your Profile
                  </a>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected Profile Editor */}
        <Route
          path="/edit-profile"
          element={user ? <EditProfile /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}
