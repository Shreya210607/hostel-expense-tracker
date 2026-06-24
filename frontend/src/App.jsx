import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [sessionKey, setSessionKey] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem('hostel_current_user') || ''
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('hostel_is_logged_in') === 'true'
  );
  const [loginError, setLoginError] = useState('');

  const handleLogin = (username, password, isSignUpMode) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setLoginError('Please fill in all fields.');
      return;
    }

    if (isSignUpMode) {
      if (localStorage.getItem(`user_pass_${cleanUsername}`)) {
        setLoginError('Username already taken!');
        return;
      }

      localStorage.setItem(
        `user_pass_${cleanUsername}`,
        cleanPassword
      );

      setLoginError('');
      setCurrentUser(cleanUsername);
      setIsLoggedIn(true);

      localStorage.setItem(
        'hostel_current_user',
        cleanUsername
      );
      localStorage.setItem(
        'hostel_is_logged_in',
        'true'
      );

      setSessionKey(Date.now());
    } else {
      const savedPassword = localStorage.getItem(
        `user_pass_${cleanUsername}`
      );

      if (!savedPassword || cleanPassword !== savedPassword) {
        setLoginError('Invalid credentials.');
        return;
      }

      setLoginError('');
      setCurrentUser(cleanUsername);
      setIsLoggedIn(true);

      localStorage.setItem(
        'hostel_current_user',
        cleanUsername
      );
      localStorage.setItem(
        'hostel_is_logged_in',
        'true'
      );

      setSessionKey(Date.now());
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setLoginError('');

    localStorage.removeItem('hostel_current_user');
    localStorage.removeItem('hostel_is_logged_in');

    setSessionKey(Date.now());
  };

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard
          key={sessionKey}
          onLogout={handleLogout}
          username={currentUser}
        />
      ) : (
        <Login
          onLoginSuccess={handleLogin}
          loginError={loginError}
        />
      )}
    </div>
  );
}

export default App;