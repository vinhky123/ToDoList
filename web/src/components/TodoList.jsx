import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

// Hàm chuyển timestamp thành định dạng ngày giờ dễ đọc
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Không có";
  const date = new Date(Number(timestamp));
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Hàm ghép ngày và giờ thành timestamp
const combineDateAndTimeToTimestamp = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;

  // Tạo ngày từ dateStr (ví dụ: "2023-10-18")
  const [year, month, day] = dateStr.split("-").map(Number);
  // Tạo giờ từ timeStr (ví dụ: "14:30")
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Tạo đối tượng Date (tháng trong JavaScript bắt đầu từ 0, nên trừ 1)
  const date = new Date(year, month - 1, day, hours, minutes, 0);
  // Trả về timestamp (mili giây)
  return date.getTime();
};

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    category_id: "",
    due_date: "",
    due_time: "", // Thêm trường để lưu giờ
    tag: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get("/api/categories", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/api/tags", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        const fetchedCategories = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        const fetchedTags = Array.isArray(tagsResponse.data)
          ? tagsResponse.data
          : [];
        setCategories(fetchedCategories);
        setTags(fetchedTags);
        console.log("Fetched categories:", fetchedCategories);
        console.log("Fetched tags:", fetchedTags);
      } catch (error) {
        setError(error.response?.data?.error || "Có lỗi khi lấy dữ liệu");
        setCategories([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTodos = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/todos/${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const fetchedTodos = Array.isArray(response.data) ? response.data : [];
      setTodos(fetchedTodos);
      console.log(`Fetched todos for category ${categoryId}:`, fetchedTodos);
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi lấy công việc");
      setTodos([]);
      console.log("Error fetching todos:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.title) {
      setError("Tiêu đề là bắt buộc");
      return;
    }
    if (!newTodo.category_id) {
      setError("Vui lòng chọn danh mục");
      return;
    }

    setActionLoading(true);
    try {
      setError("");
      // Ghép ngày và giờ thành timestamp
      const timestamp = combineDateAndTimeToTimestamp(
        newTodo.due_date,
        newTodo.due_time
      );
      const response = await axios.post(
        `/api/todos/${newTodo.category_id}`,
        {
          ...newTodo,
          due_date: timestamp, // Gửi timestamp lên backend
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTodos([...todos, response.data]);
      setNewTodo({
        title: "",
        category_id: "",
        due_date: "",
        due_time: "",
        tag: "",
      });
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi thêm công việc");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setNewTodo({ ...newTodo, category_id: categoryId });
    if (categoryId) {
      fetchTodos(categoryId);
    } else {
      setTodos([]);
    }
  };

  return (
    <div>
      <h2>Danh sách công việc</h2>
      {error && <div className="error">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tiêu đề"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
              disabled={actionLoading}
            />
            <select
              value={newTodo.category_id}
              onChange={handleCategoryChange}
              disabled={actionLoading}
            >
              <option value="">Chọn danh mục</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {/* Input cho ngày */}
            <input
              type="date"
              placeholder="Hạn chót (ngày)"
              value={newTodo.due_date}
              onChange={(e) =>
                setNewTodo({ ...newTodo, due_date: e.target.value })
              }
              disabled={actionLoading}
            />
            {/* Input cho giờ */}
            <input
              type="time"
              placeholder="Hạn chót (giờ)"
              value={newTodo.due_time}
              onChange={(e) =>
                setNewTodo({ ...newTodo, due_time: e.target.value })
              }
              disabled={actionLoading}
            />
            <select
              value={newTodo.tag}
              onChange={(e) => setNewTodo({ ...newTodo, tag: e.target.value })}
              disabled={actionLoading}
            >
              <option value="">Chọn tag (tùy chọn)</option>
              {Array.isArray(tags) &&
                tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
            </select>
            <button onClick={handleAddTodo} disabled={actionLoading}>
              {actionLoading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>

          <div className="item-list">
            <AnimatePresence>
              {Array.isArray(todos) && todos.length > 0 ? (
                todos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    className="todo-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>{todo.title}</h3>
                    <p>Danh mục: {todo.category_name || "Không có"}</p>
                    <p>Hạn chót: {formatTimestamp(todo.due_date)}</p>
                    <p>Tags: {todo.tags?.join(", ") || "Không có"}</p>
                  </motion.div>
                ))
              ) : (
                <p>Không có công việc nào trong danh mục này.</p>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default TodoList;
