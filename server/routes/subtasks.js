import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Lấy tất cả subtasks của một todo
router.get("/:todoId", auth, async (req, res) => {
  const userId = req.userId;
  const { todoId } = req.params;

  try {
    // Kiểm tra quyền truy cập todo
    const { rows: todos } = await req.db.query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );
    if (todos.length === 0) {
      return res
        .status(403)
        .json({ error: "Todo không tồn tại hoặc không thuộc về bạn" });
    }

    const { rows } = await req.db.query(
      "SELECT * FROM subtasks WHERE todo_id = $1 ORDER BY created_at",
      [todoId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi lấy subtasks" });
  }
});

// Thêm subtask mới
router.post("/:todoId", auth, async (req, res) => {
  const userId = req.userId;
  const { todoId } = req.params;
  const { title } = req.body;

  try {
    // Kiểm tra quyền truy cập todo
    const { rows: todos } = await req.db.query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );
    if (todos.length === 0) {
      return res
        .status(403)
        .json({ error: "Todo không tồn tại hoặc không thuộc về bạn" });
    }

    const { rows } = await req.db.query(
      "INSERT INTO subtasks (todo_id, title, completed) VALUES ($1, $2, $3) RETURNING *",
      [todoId, title, false]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi thêm subtask" });
  }
});

// Cập nhật trạng thái subtask (hoàn thành/chưa hoàn thành)
router.put("/:id", auth, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { completed } = req.body;

  try {
    // Kiểm tra quyền truy cập
    const { rows: subtasks } = await req.db.query(
      "SELECT s.*, t.user_id FROM subtasks s JOIN todos t ON s.todo_id = t.id WHERE s.id = $1",
      [id]
    );
    if (subtasks.length === 0 || subtasks[0].user_id != userId) {
      return res
        .status(403)
        .json({ error: "Subtask không tồn tại hoặc không thuộc về bạn" });
    }

    const { rows } = await req.db.query(
      "UPDATE subtasks SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [completed, id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi cập nhật subtask" });
  }
});

export default router;
