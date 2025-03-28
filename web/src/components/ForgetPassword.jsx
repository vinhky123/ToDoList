import { useState } from "react";
import axios from "axios";
import Loader from "./Loader";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div>
      <h2>Quên mật khẩu</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button onClick={handleForgetPassword} disabled={loading}>
            Gửi yêu cầu
          </button>
        </>
      )}
    </div>
  );
}

export default ForgetPassword;
