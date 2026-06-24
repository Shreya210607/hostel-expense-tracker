import React, { useState } from 'react';

function Login({ onLoginSuccess, loginError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handler for Sign In button click
  const handleSignInClick = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    onLoginSuccess(username, password, false); // false = Login Mode
  };

  // Handler for Create Account button click
  const handleSignUpClick = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    onLoginSuccess(username, password, true); // true = Sign Up Mode
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: '#f4f5f7',
      fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
      position: 'fixed',
      top: 0,
      left: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '35px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '400px',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#1a1a1a', 
          fontSize: '1.7rem',
          fontWeight: '700',
          margin: '0 0 6px 0'
        }}>
          Hostel Budget Guard
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '0.85rem', 
          marginTop: 0,
          marginBottom: '20px' 
        }}>
          Enter credentials below to sign in or create an account
        </p>
        
        {loginError && (
          <div style={{
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #fad2cf'
          }}>
            {loginError}
          </div>
        )}

        <form>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
              Username
            </label>
            <input 
              type="text" 
              placeholder="Your custom username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxSizing: 'border-box',
                fontSize: '0.95rem',
                backgroundColor: '#f8f9fa'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
              Password
            </label>
            <input 
              type="password" 
              placeholder="Your custom password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxSizing: 'border-box',
                fontSize: '0.95rem',
                backgroundColor: '#f8f9fa'
              }}
              required
            />
          </div>

          {/* TWO CLEAR BUTTONS ROW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              type="button" 
              onClick={handleSignInClick} 
              style={{
                width: '100%',
                padding: '12px',
                background: '#aa3bff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 10px rgba(170, 59, 255, 0.2)'
              }}
            >
              Sign In
            </button>

            <button 
              type="button" 
              onClick={handleSignUpClick} 
              style={{
                width: '100%',
                padding: '12px',
                background: '#34a853',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 10px rgba(52, 168, 83, 0.2)'
              }}
            >
              Create Account (Sign Up)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;