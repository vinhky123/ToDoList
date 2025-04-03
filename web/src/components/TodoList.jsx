// TodoList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/todolist.css"; // Tạo file CSS nếu cần

function TodoList({ token, selectedCategory }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null); // Theo dõi todo nào đang mở subtask

  useEffect(() => {
    if (!token || !selectedCategory) return;
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/categories/${selectedCategory.id}/todos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTodos(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy todos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [token, selectedCategory]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await axios.post(
        `/api/categories/${selectedCategory.id}/todos`,
        { title: newTodo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Lỗi khi thêm todo:", error);
    }
  };

  const toggleSubtasks = (todoId) => {
    setExpandedTodo(expandedTodo === todoId ? null : todoId);
  };

  const handleNotesClick = (todoId) => {
    // Điều hướng hoặc mở modal ghi chú ở đây
    console.log(`Mở notes cho todo ${todoId}`);
  };

  return (
    <div className="todo-list">
      <h2>{selectedCategory?.name || "Chọn một danh mục"}</h2>
      <div className="add-todo">
        <input
          placeholder="Thêm todo mới"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={handleAddTodo}>+</button>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : todos.length === 0 ? (
        <p>Chưa có todo nào!</p>
      ) : (
        <ul className="todos">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <span>{todo.title}</span>
              <button onClick={() => toggleSubtasks(todo.id)}>
                {expandedTodo === todo.id ? "Ẩn" : "Hiện"} Subtasks
              </button>
              <button onClick={() => handleNotesClick(todo.id)}>Notes</button>
              {expandedTodo === todo.id && (
                <div className="subtasks">
                  {/* Hiển thị subtask ở đây, hiện tại để placeholder */}
                  <p>Chưa có subtask (cần thêm API và logic).</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
