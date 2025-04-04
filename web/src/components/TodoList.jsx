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

  // Function to get background color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#d6eadf";
      case "medium":
        return "#fdffb6";
      case "low":
        return "#caffbf";
      default:
        return "#ffffff";
    }
  };

  return (
    <div className="todo-list">
      <h2>{selectedCategory.name}</h2>
      <p className="add-todos-text">Thêm công việc mới</p>
      <div className="add-todo">
        <div className="input-title">
          <p className="selection-title">Tựa đề:</p>
          <input
            placeholder={selectedCategory.name}
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
        </div>
        <div className="input-duedate">
          <p className="selection-title">Thời gian hết hạn:</p>
          <input
            type="datetime-local"
            id="dateInput"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="input-priority">
          <p className="selection-title">Độ ưu tiên:</p>
          <Select
            options={priorityOptions}
            value={priorityOptions.find(
              (option) => option.value === newTodoPriority
            )}
            onChange={(option) =>
              setNewTodoPriority(option ? option.value : "")
            }
            placeholder="-- Ưu tiên --"
          />
        </div>
        <div className="input-todos-button">
          <div className="empty">a</div>
          <button onClick={handleAddTodo}>+</button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : todos.length === 0 ? (
        <p className="no-todo-warning">Chưa có công việc nào!</p>
      ) : (
        <ul className="todos">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="todo-item"
              style={{
                backgroundColor: getPriorityColor(todo.priority),
                padding: "10px", // Optional: adds some padding for better appearance
                margin: "5px 0", // Optional: adds some spacing between items
                borderRadius: "4px", // Optional: adds rounded corners
              }}
            >
              <h3>{todo.title}</h3>

              {expandedTodo === todo.id && (
                <div className="subtasks">
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
