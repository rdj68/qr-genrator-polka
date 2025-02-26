import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  // State for form data, QR data, loading status, error, and countdown timer
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Login request (POST to login endpoint)
      const loginResponse = await fetch(`/api/v2/auth/web2-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      // Request for QR session data (GET from qr-session endpoint)
      const qrResponse = await fetch(`/api/v2/auth/qr-session`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!qrResponse.ok) {
        throw new Error('Failed to fetch QR data');
      }

      const data = await qrResponse.json();
      setQrData(data);
      // Set countdown timer (assuming expiresIn is in seconds)
      setTimeLeft(data.expiresIn);

      // After QR is displayed, delete cookies to log out the user.
      deleteAllCookies();
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility function to delete all cookies
  const deleteAllCookies = () => {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
  };

  // Countdown timer effect
  useEffect(() => {
    if (qrData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [qrData, timeLeft]);

  // Inline CSS styles
  const containerStyle = {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
    background: '#f0f0f0',
    padding: '20px'
  };

  const formStyle = {
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const qrContainerStyle = {
    textAlign: 'center',
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      {/* If no QR data, show the login form */}
      {!qrData ? (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
          <div style={{ marginBottom: '15px' }}>
            <label>Email or Username:</label>
            <input 
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <button type="submit" disabled={loading} style={{
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: 'pointer'
            }}>
              {loading ? 'Processing...' : 'Generate QR'}
            </button>
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
        </form>
      ) : (
        <div style={qrContainerStyle}>
          <h2>Your QR Code</h2>
          <QRCode value={JSON.stringify(qrData)} size={256} />
          <div style={{ marginTop: '20px', fontSize: '18px' }}>
            {timeLeft !== null && <p>Time remaining: {timeLeft} seconds</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
