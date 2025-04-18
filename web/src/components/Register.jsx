import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import "../styles/login.css";

function Register({ setToken, setLoading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");
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

    if (!firstname) {
      setError("First Name là bắt buộc");
    }

    if (!lastname) {
      setError("Last Name là bắt buộc");
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        username,
        password,
        email,
        firstname,
        lastname,
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
    <div className="login-container">
      <div className="login-form">
        <h2>Đăng ký</h2>
        {error && <div className="error">{error}</div>}
        <form>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
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
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button className="login-button" onClick={handleRegister}>
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
