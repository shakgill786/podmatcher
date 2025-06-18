// react-vite/src/main.jsx

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer, { thunkAuthenticate } from "./store/sessionSlice";
import usersReducer from "./store/usersSlice";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

const store = configureStore({
  reducer: {
    session: sessionReducer,
    users: usersReducer,
  },
});

function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        await fetch("http://localhost:5000/api/csrf/restore", {
          credentials: "include",
        });
        await dispatch(thunkAuthenticate());
      } catch (err) {
        console.warn("⚠️ Auth load failed:", err);
      } finally {
        setLoaded(true);
      }
    };
    restore();
  }, [dispatch]);

  if (!loaded) {
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  }
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
