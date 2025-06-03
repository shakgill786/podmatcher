import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sessionReducer, { thunkAuthenticate } from './store/sessionSlice';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

const store = configureStore({
  reducer: {
    session: sessionReducer,
  },
});

function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(thunkAuthenticate());
  }, [dispatch]);

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthLoader>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </AuthLoader>
    </BrowserRouter>
  </Provider>
);
