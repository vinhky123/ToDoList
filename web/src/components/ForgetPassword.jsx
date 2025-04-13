import { useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import "../styles/login.css";

function ForgetPassword(setLoading) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgetPassword = async () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("/api/auth/forget", { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form">
          <h2>Quên mật khẩu</h2>
          <div className="form-group">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button onClick={handleForgetPassword}>Gửi yêu cầu</button>

          {error && (
            <div style={{ color: "red", marginTop: "10px" }} className="error">
              {error}
            </div>
          )}
          {message && (
            <div
              className="success"
              style={{ color: "green", marginTop: "10px" }}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgetPassword;
