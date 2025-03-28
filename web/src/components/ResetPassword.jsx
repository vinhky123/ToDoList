import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ");
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("/api/auth/reset", {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Chuyển hướng về trang login sau 2 giây
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
      <h2>Đặt lại mật khẩu</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button onClick={handleResetPassword} disabled={loading}>
            Đặt lại mật khẩu
          </button>
        </>
      )}
    </div>
  );
}

export default ResetPassword;
