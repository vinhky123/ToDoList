import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Lấy tất cả todos trong một category
router.get("/:idCategory", auth, async (req, res) => {
  const userID = req.userId;
  const { idCategory } = req.params;

  try {
    const { rows } = await req.db.query(
      "SELECT t.*, c.name as category_name FROM categories c LEFT JOIN todos t ON c.id = t.category_id WHERE c.user_id = $1 AND c.id = $2",
      [userID, idCategory]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi khi lấy dữ liệu" });
  }
});

// Thêm todo vào một category
router.post("/:idCategory", auth, async (req, res) => {
  const userID = req.userId;
  const { idCategory } = req.params;
  const { title, dueDate, priority } = req.body;

  const client = await req.db.connect();
  try {
    await client.query("BEGIN");

    const { rows: userCategories } = await client.query(
      "SELECT user_id FROM categories WHERE id = $1",
      [idCategory]
    );
    if (userCategories.length === 0 || userCategories[0].user_id != userID) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ error: "Danh mục không thuộc về bạn hoặc không tồn tại" });
    }

    const { rows } = await client.query(
      "INSERT INTO todos (title, category_id, user_id, due_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, idCategory, userID, dueDate, priority]
    );
    const todo = rows[0];

    // Tạo thông báo nhắc nhở (nếu có due_date)
    if (dueDate) {
      const scheduledAt = new Date(
        new Date(dueDate).getTime() - 24 * 60 * 60 * 1000
      ); // Nhắc trước 1 ngày
      await client.query(
        "INSERT INTO notifications (user_id, todo_id, type, title, content, status, scheduled_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())",
        [
          userID,
          todo.id,
          "email",
          `Nhắc nhở: Hoàn thành task`,
          `Task "${title}" của bạn sẽ đến hạn vào ${dueDate}!`,
          "pending",
          scheduledAt,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(todo);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Có lỗi khi thêm dữ liệu" });
  } finally {
    client.release();
  }
});

export default router;
