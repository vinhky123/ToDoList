import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/todolist.css";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

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

  const handleDeleteTodo = async (TodoID, event) => {
    event.stopPropagation();
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
    }
  };

  const handleNotificesStatus = async (TodoID) => {
    try {
      await axios.put(
        `api/todos/${selectedCategory.id}/${TodoID}/putNotificate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTodos(
        todos.map((todo) =>
          todo.id === TodoID ? { ...todo, notificate: !todo.notificate } : todo
        )
      );
    } catch (error) {
      console.log(error);
      console.log("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  function GetNotificateStatusIcon({ notificate, todoID }) {
    const handleClick = (event) => {
      handleNotificesStatus(todoID);
    };

    return (
      <svg
        className="notificate-button"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClick}
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {notificate ? (
            <path
              d="M9.00195 17H5.60636C4.34793 17 3.71872 17 3.58633 16.9023C3.4376 16.7925 3.40126 16.7277 3.38515 16.5436C3.37082 16.3797 3.75646 15.7486 4.52776 14.4866C5.32411 13.1835 6.00031 11.2862 6.00031 8.6C6.00031 7.11479 6.63245 5.69041 7.75766 4.6402C8.88288 3.59 10.409 3 12.0003 3C13.5916 3 15.1177 3.59 16.2429 4.6402C17.3682 5.69041 18.0003 7.11479 18.0003 8.6C18.0003 11.2862 18.6765 13.1835 19.4729 14.4866C20.2441 15.7486 20.6298 16.3797 20.6155 16.5436C20.5994 16.7277 20.563 16.7925 20.4143 16.9023C20.2819 17 19.6527 17 18.3943 17H15.0003M9.00195 17L9.00031 18C9.00031 19.6569 10.3435 21 12.0003 21C13.6572 21 15.0003 19.6569 15.0003 18V17M9.00195 17H15.0003"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          ) : (
            <path
              d="M3 3L21 21M9.37747 3.56325C10.1871 3.19604 11.0827 3 12 3C13.5913 3 15.1174 3.59 16.2426 4.6402C17.3679 5.69041 18 7.11479 18 8.6C18 10.3566 18.2892 11.7759 18.712 12.9122M17 17H15M6.45339 6.46451C6.15686 7.13542 6 7.86016 6 8.6C6 11.2862 5.3238 13.1835 4.52745 14.4866C3.75616 15.7486 3.37051 16.3797 3.38485 16.5436C3.40095 16.7277 3.43729 16.7925 3.58603 16.9023C3.71841 17 4.34762 17 5.60605 17H9M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17M9 17H15"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          )}
        </g>
      </svg>
    );
  }

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
                    onClick={(e) => handleStatusDone(todo.id, e)}
                    className="status-done-mark"
                  >
                    Hoàn thành <b style={{ color: "green" }}>&#10003;</b>{" "}
                  </a>
                )}
              </div>
            </span>
            <div className="delete-notes-button-container">
              <button
                className="delete-todo-button"
                onClick={() => todo?.id && handleDeleteTodo(todo.id)}
              >
                x
              </button>
              <Link to={`/todos/notes/${todo.id}`}>
                <svg
                  className="notes-button"
                  fill="#000000"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  data-name="Layer 1"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M6.97,30.75H25.03c.41,0,.75-.34,.75-.75V3.89c0-.41-.34-.75-.75-.75h-2.56v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-4.22v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-4.22v-1.14c0-.41-.34-.75-.75-.75s-.75,.34-.75,.75v1.14h-2.56c-.41,0-.75,.34-.75,.75V30c0,.41,.34,.75,.75,.75Zm.75-26.11h1.81v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h4.22v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h4.22v1.14c0,.41,.34,.75,.75,.75s.75-.34,.75-.75v-1.14h1.81V29.25H7.72V4.64Z"></path>
                    <path d="M16.86,9.66h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"></path>
                    <path d="M16.86,16.19h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"></path>
                    <path d="M16.86,22.73h-6.57c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h6.57c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"></path>
                    <path d="M10.28,14.27h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75Z"></path>
                    <path d="M10.28,21h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75Z"></path>
                    <path d="M13.89,25.79h-3.61c-.41,0-.75,.34-.75,.75s.34,.75,.75,.75h3.61c.41,0,.75-.34,.75-.75s-.34-.75-.75-.75Z"></path>
                  </g>
                </svg>
              </Link>
              <GetNotificateStatusIcon
                notificate={todo.notificate}
                todoID={todo.id}
              />
            </div>
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
