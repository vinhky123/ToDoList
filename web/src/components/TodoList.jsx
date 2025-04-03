import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/todos.css";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedTodo, setSelectedTodo] = useState(null); // Để mở note
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "default"; // Lấy category từ URL
  const token = localStorage.getItem("token");

  // Lấy todos theo category
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(`/api/todos?category=${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy todos:", error);
      }
    };
    fetchTodos();
  }, [categoryId, token]);

  // Thêm todo mới
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await axios.post(
        "/api/todos",
        { title: newTodo, categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Lỗi khi thêm todo:", error);
    }
  };

  // Thêm subtask
  const handleAddSubtask = async (todoId, subtaskTitle) => {
    try {
      const response = await axios.post(
        `/api/todos/${todoId}/subtasks`,
        { title: subtaskTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(
        todos.map((todo) =>
          todo.id === todoId
            ? { ...todo, subtasks: [...(todo.subtasks || []), response.data] }
            : todo
        )
      );
    } catch (error) {
      console.error("Lỗi khi thêm subtask:", error);
    }
  };

  return (
    <div className="todo-container">
      {selectedTodo ? (
        <TodoNote todo={selectedTodo} setSelectedTodo={setSelectedTodo} />
      ) : (
        <>
          <h2>Công việc</h2>
        </>
      )}
    </div>
  );
}

function TodoNote({ todo, setSelectedTodo }) {
  const [note, setNote] = useState(todo.note || "");
  const token = localStorage.getItem("token");

  const handleSaveNote = async () => {
    try {
      await axios.put(
        `/api/todos/${todo.id}`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTodo(null);
    } catch (error) {
      console.error("Lỗi khi lưu note:", error);
    }
  };

  return (
    <div className="todo-note">
      <h2>Ghi chú cho: {todo.title}</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú của bạn (hỗ trợ code, text, v.v.)"
      />
      <div className="note-actions">
        <button onClick={handleSaveNote}>Lưu</button>
        <button onClick={() => setSelectedTodo(null)}>Quay lại</button>
      </div>
    </div>
  );
}

export default TodoList;
