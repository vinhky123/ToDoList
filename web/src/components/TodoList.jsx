import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/todolist.css";
import Loader from "../components/Loader";

function TodoList({ token, selectedCategory }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !selectedCategory) return;
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/todos/${selectedCategory.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(response.data);
        console.log(todos.length);
      } catch (error) {
        console.error("Lỗi khi lấy todos:", error);
        setError("Không thể tải danh sách công việc. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [token, selectedCategory]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) {
      setError("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    try {
      const response = await axios.post(
        `/api/todos/${selectedCategory.id}`,
        { title: newTodo, dueDate: dueDate, priority: newTodoPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, response.data]);
      setNewTodo("");
      setDueDate("");
      setNewTodoPriority("");
      setError("");
    } catch (error) {
      console.error("Lỗi khi thêm todo:", error);
      setError("Không thể thêm công việc. Vui lòng thử lại.");
    }
  };

  const handleDeleteTodo = async (TodoID) => {
    try {
      await axios.delete(`api/todos/${selectedCategory.id}/${TodoID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((todo) => todo.id !== TodoID));
      setError("");
    } catch (error) {
      setError("Không thể xóa công việc. Vui lòng thử lại.");
    }
  };

  const toggleSubtasks = (todoId) => {
    setExpandedTodo(expandedTodo === todoId ? null : todoId);
  };

  const handleNotesClick = (todoId) => {
    console.log(`Mở notes cho todo ${todoId}`);
  };

  const priorityOptions = [
    { value: "", label: "-- Ưu tiên --" },
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f37324";
      case "medium":
        return "#f8cc1b";
      case "low":
        return "#72b043";
      default:
        return "#ffffff";
    }
  };

  function todoList() {
    if (loading) return <Loader />;

    if (todos.length === 0)
      return <p className="no-todo-warning">Chưa có công việc nào!</p>;

    return (
      <ul className="todos">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="todo-item"
            style={{
              border: "solid 4px" + getPriorityColor(todo.priority),
              padding: "10px",
              margin: "5px 0",
              borderRadius: "10px",
            }}
          >
            <span className="title-todo">
              <h3>{todo.title}</h3>
            </span>
            <button
              className="delete-todo-button"
              onClick={() => todo?.id && handleDeleteTodo(todo.id)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    );
  }

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
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="input-todos-button">
          <div className="empty">a</div>
          <button onClick={handleAddTodo}>+</button>
        </div>
      </div>

      {todoList()}
      {error && (
        <p
          className="error-message"
          style={{ color: "red", fontSize: "14px", marginTop: "10px" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default TodoList;
