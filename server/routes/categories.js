import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const userID = req.userId;
  try {
    const { rows } = await req.db.query(
      "SELECT * FROM categories WHERE user_id = $1",
      [userID]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi lấy danh mục" });
  }
});

router.post("/", auth, async (req, res) => {
  const userID = req.userId;
  const { name } = req.body;

  try {
    const { rows } = await req.db.query(
      "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userID]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Có lỗi khi thêm danh mục" });
  }
});

router.put("/:id", auth, async (req, res) => {
  const userID = req.userId;
  const { name } = req.body;

  try {
    const { rowCount } = await req.db.query(
      "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
      [req.params.id, userID]
    );
    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy danh mục hoặc bạn không có quyền" });
    }

    const { rows } = await req.db.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi đổi tên danh mục" });
  }
});

export default router;
