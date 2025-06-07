import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer, { thunkAuthenticate } from "./store/sessionSlice";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

const store = configureStore({
  reducer: {
    session: sessionReducer,
  },
});

function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1. 🛡️ Fetch CSRF token and set cookie
        await fetch("/api/csrf/restore", {
          credentials: "include",
        });

        // 2. 🔐 Try to restore session
        await dispatch(thunkAuthenticate());

      } catch (err) {
        console.warn("Auto-login failed:", err);
      } finally {
        setLoaded(true); // ✅ Only show app after auth attempt
      }
    };

    restoreSession();
  }, [dispatch]);

  // Show a loading screen until auth check is done
  if (!loaded) return <div className="text-center mt-20 text-gray-600">Loading...</div>;

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthLoader>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </AuthLoader>
    </BrowserRouter>
  </Provider>
);
