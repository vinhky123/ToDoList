import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Lấy tất cả todos của 1 users
router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      "SELECT t.*, c.name as category_name FROM todos t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = $1",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi khi lấy dữ liệu" });
  }
});

// Lấy tất cả todos trong một category
router.get("/:idCategory", auth, async (req, res) => {
  const userID = req.userId;
  const { idCategory } = req.params;

  try {
    const { rows } = await req.db.query(
      "SELECT t.*, c.name as category_name FROM categories c JOIN todos t ON c.id = t.category_id WHERE c.user_id = $1 AND c.id = $2 ORDER BY t.due_date ASC",
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

  const processedDueDate =
    dueDate === "" || dueDate === undefined ? null : dueDate;

  const processedPriority =
    priority === "" || priority === undefined ? null : priority;

  try {
    const { rows: userCategories } = await req.db.query(
      "SELECT user_id FROM categories WHERE id = $1",
      [idCategory]
    );
    if (userCategories.length === 0 || userCategories[0].user_id != userID) {
      return res
        .status(403)
        .json({ error: "Danh mục không thuộc về bạn hoặc không tồn tại" });
    }

    const { rows } = await req.db.query(
      "INSERT INTO todos (title, category_id, due_date, priority) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, idCategory, processedDueDate, processedPriority]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Có lỗi khi thêm dữ liệu" });
  }
});

// Xóa todo của một category
router.delete("/:idCategory/:id", auth, async (req, res) => {
  const userID = req.userId;
  const idCategory = req.params.idCategory;
  const id = req.params.id;
  try {
    const { rows: userCategories } = await req.db.query(
      "SELECT user_id FROM categories WHERE id = $1",
      [idCategory]
    );
    if (userCategories.length === 0 || userCategories[0].user_id != userID) {
      return res
        .status(403)
        .json({ error: "Danh mục không thuộc về bạn hoặc không tồn tại" });
    }

    const { rows } = await req.db.query("DELETE FROM todos WHERE id = $1", [
      id,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi khi xóa dữ liệu" });
  }
});

export default router;

// Đánh dấu là 1 task đã hoàn thành
router.put("/:idCategory/:id/done", auth, async (req, res) => {
  const userID = req.userId;
  const idCategory = req.params.idCategory;
  const id = req.params.id;
  try {
    const { rows: userCategories } = await req.db.query(
      "SELECT user_id FROM categories WHERE id = $1",
      [idCategory]
    );
    if (userCategories.length === 0 || userCategories[0].user_id != userID) {
      return res
        .status(403)
        .json({ error: "Danh mục không thuộc về bạn hoặc không tồn tại" });
    }

    const { rows } = await req.db.query(
      "UPDATE todos SET completed = TRUE WHERE id = $1",
      [id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi khi đánh dấu là hoàn thành" });
  }
});

// Bật / tắt tính năng thông báo
router.put("/:idCategory/:id/putNotificate", auth, async (req, res) => {
  const userID = req.userId;
  const idCategory = req.params.idCategory;
  const id = req.params.id;
  try {
    const { rows: userCategories } = await req.db.query(
      "SELECT user_id FROM categories WHERE id = $1",
      [idCategory]
    );
    if (userCategories.length === 0 || userCategories[0].user_id != userID) {
      return res
        .status(403)
        .json({ error: "Danh mục không thuộc về bạn hoặc không tồn tại" });
    }

    const { rows: current } = await req.db.query(
      `SELECT notificate FROM todos WHERE id = $1`,
      [id]
    );

    const currentStatus = current[0].notificate;
    const targetStatus = !currentStatus;

    const { rows } = await req.db.query(
      "UPDATE todos SET notificate = $1 WHERE id = $2",
      [targetStatus, id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Có lỗi khi đánh dấu là hoàn thành" });
  }
});
