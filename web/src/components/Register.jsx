import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

function Register({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username) {
      setError("Username là bắt buộc");
      return;
    }
    if (!password) {
      setError("Password là bắt buộc");
      return;
    }

    if (!email) {
      setError("Email là bắt buộc");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        username,
        password,
        email,
      });
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setError("");
      navigate("/todos");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button onClick={handleRegister} disabled={loading}>
            Đăng ký
          </button>
        </>
      )}
    </div>
  );
}

export default Register;
