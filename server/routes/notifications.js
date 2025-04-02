import express from "express";
import { auth } from "../middleware/auth.js";
import sendEmail from "../utils/sendmail.js";

const router = express.Router();

// Lấy danh sách thông báo của người dùng
router.get("/", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const { rows } = await req.db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi lấy thông báo" });
  }
});

// Tạo thông báo thủ công (cho testing)
router.post("/", auth, async (req, res) => {
  const userId = req.userId;
  const { todoId, type, title, content, scheduledAt } = req.body;

  try {
    // Kiểm tra quyền truy cập todo (nếu có)
    if (todoId) {
      const { rows: todos } = await req.db.query(
        "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
        [todoId, userId]
      );
      if (todos.length === 0) {
        return res
          .status(403)
          .json({ error: "Todo không tồn tại hoặc không thuộc về bạn" });
      }
    }

    const { rows } = await req.db.query(
      "INSERT INTO notifications (user_id, todo_id, type, title, content, status, scheduled_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [
        userId,
        todoId || null,
        type,
        title,
        content,
        "pending",
        scheduledAt || new Date(),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi tạo thông báo" });
  }
});

// Cập nhật trạng thái thông báo
router.put("/:id", auth, async (req, res) => {
  const { status } = req.body; // e.g., "sent", "cancelled"
  try {
    const { rows } = await req.db.query(
      "UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *",
      [status, req.params.id, req.userId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Thông báo không tồn tại hoặc không thuộc về bạn" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi cập nhật thông báo" });
  }
});

// Xóa thông báo
router.delete("/:id", auth, async (req, res) => {
  try {
    const { rowCount } = await req.db.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Thông báo không tồn tại hoặc không thuộc về bạn" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi xóa thông báo" });
  }
});

export default router;
