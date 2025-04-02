import express from "express";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Lấy note của một todo (bao gồm các blocks)
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

    // Lấy note
    const { rows: notes } = await req.db.query(
      "SELECT * FROM task_notes WHERE todo_id = $1",
      [todoId]
    );
    if (notes.length === 0) {
      return res.status(404).json({ error: "Note không tồn tại" });
    }

    const note = notes[0];
    // Lấy các blocks của note
    const { rows: blocks } = await req.db.query(
      "SELECT * FROM note_blocks WHERE note_id = $1 ORDER BY order",
      [note.id]
    );

    res.json({ ...note, blocks });
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi lấy note" });
  }
});

// Tạo note cho một todo
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

    // Kiểm tra xem note đã tồn tại chưa
    const { rows: existingNotes } = await req.db.query(
      "SELECT * FROM task_notes WHERE todo_id = $1",
      [todoId]
    );
    if (existingNotes.length > 0) {
      return res.status(400).json({ error: "Note đã tồn tại cho todo này" });
    }

    const { rows } = await req.db.query(
      "INSERT INTO task_notes (todo_id, title) VALUES ($1, $2) RETURNING *",
      [todoId, title || "Ghi chú"]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi tạo note" });
  }
});

// Thêm block vào note
router.post("/:todoId/blocks", auth, async (req, res) => {
  const userId = req.userId;
  const { todoId } = req.params;
  const { type, content, order } = req.body;

  try {
    // Kiểm tra quyền truy cập
    const { rows: todos } = await req.db.query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );
    if (todos.length === 0) {
      return res
        .status(403)
        .json({ error: "Todo không tồn tại hoặc không thuộc về bạn" });
    }

    // Lấy note
    const { rows: notes } = await req.db.query(
      "SELECT * FROM task_notes WHERE todo_id = $1",
      [todoId]
    );
    if (notes.length === 0) {
      return res.status(404).json({ error: "Note không tồn tại" });
    }

    const noteId = notes[0].id;
    const { rows } = await req.db.query(
      "INSERT INTO note_blocks (note_id, type, content, order) VALUES ($1, $2, $3, $4) RETURNING *",
      [noteId, type, content, order]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi thêm block" });
  }
});

// Cập nhật block
router.put("/blocks/:blockId", auth, async (req, res) => {
  const userId = req.userId;
  const { blockId } = req.params;
  const { content } = req.body;

  try {
    // Kiểm tra quyền truy cập
    const { rows: blocks } = await req.db.query(
      "SELECT nb.*, t.user_id FROM note_blocks nb JOIN task_notes tn ON nb.note_id = tn.id JOIN todos t ON tn.todo_id = t.id WHERE nb.id = $1",
      [blockId]
    );
    if (blocks.length === 0 || blocks[0].user_id != userId) {
      return res
        .status(403)
        .json({ error: "Block không tồn tại hoặc không thuộc về bạn" });
    }

    const { rows } = await req.db.query(
      "UPDATE note_blocks SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [content, blockId]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi cập nhật block" });
  }
});

// Cập nhật note
router.put("/:todoId", auth, async (req, res) => {
  const { title } = req.body;
  try {
    const { rows } = await req.db.query(
      "UPDATE task_notes SET title = $1, updated_at = NOW() WHERE todo_id = $2 AND EXISTS (SELECT 1 FROM todos WHERE id = $2 AND user_id = $3) RETURNING *",
      [title, req.params.todoId, req.userId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Note không tồn tại hoặc không thuộc về bạn" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi cập nhật note" });
  }
});

// Xóa note
router.delete("/:todoId", auth, async (req, res) => {
  try {
    const { rowCount } = await req.db.query(
      "DELETE FROM task_notes WHERE todo_id = $1 AND EXISTS (SELECT 1 FROM todos WHERE id = $1 AND user_id = $2)",
      [req.params.todoId, req.userId]
    );
    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Note không tồn tại hoặc không thuộc về bạn" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi xóa note" });
  }
});

// Xóa block
router.delete("/blocks/:blockId", auth, async (req, res) => {
  try {
    const { rowCount } = await req.db.query(
      "DELETE FROM note_blocks nb USING task_notes tn, todos t WHERE nb.id = $1 AND nb.note_id = tn.id AND tn.todo_id = t.id AND t.user_id = $2",
      [req.params.blockId, req.userId]
    );
    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Block không tồn tại hoặc không thuộc về bạn" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Có lỗi khi xóa block" });
  }
});

export default router;
