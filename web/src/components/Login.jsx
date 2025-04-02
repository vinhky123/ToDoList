import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Loader from "./Loader";
import "../styles/login.css";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username) {
      setError("Username là bắt buộc");
      return;
    }
    if (!password) {
      setError("Password là bắt buộc");
      return;
    }

    setLoading(true);
    try {
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
      setError(error.response?.data?.error || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Đăng nhập</h2>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="text"
              placeholder="User name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <p style={{ margin: "10px 0px" }}>
            <Link to="/forget">Quên mật khẩu</Link>
          </p>
          <button
            className="login-button"
            type="submit"
            onClick={handleLogin}
            disabled={loading}
          >
            Đăng nhập
          </button>
        </>
      )}
    </div>
  );
}

export default Login;
