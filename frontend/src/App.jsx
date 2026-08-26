import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';
import { getCurrentUser, setCurrentUser, getAuthToken } from './utils/api';

/**
 * Decode JWT and check if it's expired.
 * Returns true if the token is valid and not expired.
 */
function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount: restore session only if JWT is still valid
    const savedUser = getCurrentUser();
    const token = getAuthToken();
    if (savedUser && isTokenValid(token)) {
      setUser(savedUser);
    } else {
      // Token expired or missing — clear stale data
      setCurrentUser(null);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      {!user ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AppProvider user={user} onLogout={handleLogout}>
          <AppRoutes />
        </AppProvider>
      )}
    </BrowserRouter>
  );
}
