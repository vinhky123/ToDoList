import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

function TagList() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editTag, setEditTag] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/tags", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTags(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi lấy tags");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag) {
      setError("Tên tag là bắt buộc");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(
        "/api/tags",
        { name: newTag },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTags([...tags, response.data]);
      setNewTag("");
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi thêm tag");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTag = (tag) => {
    setEditTag(tag);
    setEditName(tag.name);
  };

  const handleUpdateTag = async (id) => {
    if (!editName) {
      setError("Tên tag là bắt buộc");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.put(
        `/api/tags/${id}`,
        { name: editName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTags(tags.map((t) => (t.id === id ? response.data : t)));
      setEditTag(null);
      setEditName("");
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi cập nhật tag");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTag = async (id) => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/tags/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTags(tags.filter((t) => t.id !== id));
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi xóa tag");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h2>Quản lý tags</h2>
      {error && <div className="error">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tên tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              disabled={actionLoading}
            />
            <button onClick={handleAddTag} disabled={actionLoading}>
              {actionLoading ? "Đang thêm..." : "Thêm tag"}
            </button>
          </div>

          <div className="item-list">
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  className="item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {editTag && editTag.id === tag.id ? (
                    <div className="form-group">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={actionLoading}
                      />
                      <div className="item-actions">
                        <button
                          onClick={() => handleUpdateTag(tag.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => setEditTag(null)}
                          disabled={actionLoading}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="item-content">{tag.name}</span>
                      <div className="item-actions">
                        <button
                          onClick={() => handleEditTag(tag)}
                          disabled={actionLoading}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={actionLoading}
                        >
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default TagList;
