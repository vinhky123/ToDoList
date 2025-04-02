import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendmail.js";
import rateLimit from "express-rate-limit";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const { rowCount: rowUser } = await req.db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (rowUser > 0) {
      return res.status(400).json({ error: "User đã tồn tại" });
    }

    const { rowCount: rowEmail } = await req.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (rowEmail > 0) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await req.db.query(
      "INSERT INTO users (username, hashed_password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi đăng ký" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { rows } = await req.db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Username không tồn tại" });
    }

    const isTruePassword = await bcrypt.compare(password, user.hashed_password);
    if (!isTruePassword) {
      return res.status(401).json({ error: "Sai mật khẩu" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Có lỗi đăng nhập" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi lấy thông tin người dùng" });
  }
});

router.post("/forget", async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await req.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: "Email không tồn tại" });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await req.db.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at, is_used) VALUES ($1, $2, $3, $4)",
      [user.id, resetToken, expiresAt, false]
    );

    const resetLink = `http://localhost:5173/reset?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Yêu cầu đặt lại mật khẩu",
      `Nhấn vào link sau để đặt lại mật khẩu của bạn: ${resetLink}\nLink này có hiệu lực trong 1 giờ.`
    );

    res.json({
      message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
    });
  } catch (error) {
    console.error("Error in forget password:", error);
    res.status(500).json({ error: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
});

router.post("/reset", async (req, res) => {
  const { token, newPassword } = req.body;
  const client = await req.db.connect();
  try {
    await client.query("BEGIN");

    const tokenResult = await client.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1",
      [token]
    );
    const resetToken = tokenResult.rows[0];
    if (!resetToken) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (resetToken.is_used) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Token đã được sử dụng" });
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Token đã hết hạn" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await client.query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);
    const user = userResult.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query("UPDATE users SET hashed_password = $1 WHERE id = $2", [
      hashedPassword,
      user.id,
    ]);

    await client.query(
      "UPDATE password_reset_tokens SET is_used = $1 WHERE token = $2",
      [true, token]
    );

    await client.query("COMMIT");
    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in reset password:", error);
    res.status(500).json({ error: "Có lỗi xảy ra, vui lòng thử lại sau" });
  } finally {
    client.release();
  }
});

export default router;
