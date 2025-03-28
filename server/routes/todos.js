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

    // Lấy tags cho mỗi todo
    for (let todo of rows) {
      if (todo.id) {
        const { rows: tags } = await req.db.query(
          "SELECT t.name FROM tags t JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = $1",
          [todo.id]
        );
        todo.tags = tags.map((tag) => tag.name);
      } else {
        todo.tags = [];
      }
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi khi lấy dữ liệu" });
  }
});

// Thêm todo vào một category
router.post("/:idCategory", auth, async (req, res) => {
  const userID = req.userId;
  const { idCategory } = req.params;
  const { title, dueDate, priority, tag: tagId } = req.body;

  const client = await req.db.connect();
  try {
    await client.query("BEGIN");

    // Kiểm tra quyền sở hữu
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

    // Thêm todo
    const { rows } = await client.query(
      "INSERT INTO todos (title, category_id, due_date, priority) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, idCategory, dueDate, priority]
    );
    const todo = rows[0];

    // Thêm tag (nếu có)
    if (tagId) {
      const { rows: tagRows } = await client.query(
        "SELECT * FROM tags WHERE id = $1 AND user_id = $2",
        [tagId, userID]
      );
      if (tagRows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(403)
          .json({ error: "Tag không thuộc về bạn hoặc không tồn tại" });
      }

      await client.query(
        "INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2)",
        [todo.id, tagId]
      );
      todo.tags = [tagRows[0].name];
    } else {
      todo.tags = [];
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
