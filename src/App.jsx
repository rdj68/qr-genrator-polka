import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

function App() {
  // States for login data, QR session, loading, error, countdown, and QR code size.
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [qrSize, setQrSize] = useState(200);

  // Adjust QR code size for responsiveness.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 200) {
        setQrSize(window.innerWidth * 0.9);
      } else {
        setQrSize(200);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update form field values.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Send login request.
      const loginResponse = await fetch(`/api/v2/auth/web2-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!loginResponse.ok) throw new Error("Login failed");

      // Request QR session data.
      const qrResponse = await fetch(`/api/v2/auth/qr-session`, {
        method: "GET",
        credentials: "include",
      });

      if (!qrResponse.ok) {
        throw new Error("Failed to fetch QR data");
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

  // Delete all cookies.
  const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  };

  // Countdown timer effect.
  useEffect(() => {
    if (qrData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
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

  // Container styling: centers content with a light background.
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    background: "#f8f8f8",
    minHeight: "100vh",
    color: "#000",
  };

  // Simplified form style (no extra box or shadow).
  const formStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
    background: "#fff",
    borderRadius: "4px",
    marginBottom: "20px",
  };

  // Input styling.
  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
  };

  // Button styling.
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  };

  // QR code container style.
  const qrContainerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    padding: "20px",
    borderRadius: "4px",
  };

  return (
    <div style={containerStyle}>
      {!qrData && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
          <label>Email or Username:</label>
          <input
            type="text"
            name="emailOrUsername"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Processing..." : "Generate QR"}
          </button>
          {error && (
            <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
              {error}
            </p>
          )}
        </form>
      )}
      {/* Display QR code below the form if available */}
      {qrData && (
        <div style={qrContainerStyle}>
          <h3>Your QR Code</h3>
          <QRCode value={JSON.stringify(qrData)} size={qrSize} />
          {timeLeft !== null && <p>Time remaining: {timeLeft} seconds</p>}
        </div>
      )}
    </div>
  );
}

export default App;
