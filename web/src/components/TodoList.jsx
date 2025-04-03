import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/todolist.css";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { color } from "framer-motion";

function TodoList({ token, selectedCategory }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [newTodoPriority, setNewTodoPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null);

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
        `/api/todos/${selectedCategory.id}`,
        { title: newTodo, dueDate: dueDate, priority: newTodoPriority },
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
    console.log(`Mở notes cho todo ${todoId}`);
  };

  const priorityOptions = [
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
  ];

  return (
    <div className="todo-list">
      <h2>{selectedCategory.name}</h2>
      <p className="add-todos-text">Thêm công việc mới</p>
      <div className="add-todo">
        <p className="selection-title">Tựa đề</p>
        <input
          placeholder={selectedCategory.name}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <p className="selection-title">Thời gian hết hạn</p>
        <input
          type="datetime-local"
          id="dateInput"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <p className="selection-title">Độ ưu tiên</p>
        <Select
          options={priorityOptions}
          value={priorityOptions.find(
            (option) => option.value === newTodoPriority
          )}
          onChange={(option) => setNewTodoPriority(option ? option.value : "")}
          placeholder="-- Ưu tiên --"
        />
        <button onClick={handleAddTodo}>+</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : todos.length === 0 ? (
        <p className="no-todo-warning">Chưa có công việc nào!</p>
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
