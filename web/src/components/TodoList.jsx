import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/todolist.css";
import Loader from "../components/Loader";
import { header } from "framer-motion/client";

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
      setLoading(true);
      const payload = { title: newTodo };
      if (dueDate) payload.dueDate = dueDate;
      if (newTodoPriority) payload.priority = newTodoPriority;

      const response = await axios.post(
        `/api/todos/${selectedCategory.id}`,
        payload,
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (TodoID) => {
    try {
      setLoading(true);
      await axios.delete(`api/todos/${selectedCategory.id}/${TodoID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((todo) => todo.id !== TodoID));
      setError("");
    } catch (error) {
      setError("Không thể xóa công việc. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
        return "none";
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Intl.DateTimeFormat("vi-VN", options).format(
      new Date(dateString)
    );
  };

  const getDueStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return "Quá hạn";
    } else if (diffHours < 24) {
      const hoursLeft = Math.floor(diffHours);
      return `Còn ${hoursLeft} tiếng`;
    } else {
      const dayLeft = ~~(diffHours / 24);
      return `Còn ${dayLeft} ngày`;
    }
  };

  const handleStatusDone = async (TodoID) => {
    try {
      setLoading(true);
      await axios.put(
        `api/todos/${selectedCategory.id}/${TodoID}/done`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTodos(
        todos.map((todo) =>
          todo.id === TodoID ? { ...todo, completed: true } : todo
        )
      );
    } catch (error) {
      console.log(error);
      console.log("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  function todoList() {
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
              margin: "10x 0",
              borderRadius: "10px",
              boxShadow: "5px 5px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span className="title-todo">
              <h3>{todo.title}</h3>
              <div>
                {todo.due_date ? (
                  <>
                    <span>
                      <b>Hạn: </b>
                      {formatDate(todo.due_date)}
                    </span>
                    <br></br>
                    <span>({getDueStatus(todo.due_date)})</span>
                    <br></br>
                  </>
                ) : null}

                <span>
                  {todo.completed ? (
                    <b style={{ color: "green" }}>Đã xong</b>
                  ) : (
                    <b style={{ color: "red" }}>Chưa xong</b>
                  )}
                </span>
                <br></br>
                {todo.completed ? (
                  <></>
                ) : (
                  <a
                    onClick={() => handleStatusDone(todo.id)}
                    className="status-done-mark"
                  >
                    Hoàn thành <b style={{ color: "green" }}>&#10003;</b>{" "}
                  </a>
                )}
              </div>
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
    <>
      {loading ? <Loader /> : <></>}
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
    </>
  );
}

export default TodoList;
