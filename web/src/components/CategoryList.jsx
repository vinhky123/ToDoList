import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi lấy danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) {
      setError("Tên danh mục là bắt buộc");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(
        "/api/categories",
        { name: newCategory },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCategories([...categories, response.data]);
      setNewCategory("");
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi thêm danh mục");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async (id) => {
    if (!editName) {
      setError("Tên danh mục là bắt buộc");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.put(
        `/api/categories/${id}`,
        { name: editName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCategories(
        categories.map((cat) => (cat.id === id ? response.data : cat))
      );
      setEditCategory(null);
      setEditName("");
      setError("");
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi khi cập nhật danh mục");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h2>Quản lý danh mục</h2>
      {error && <div className="error">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tên danh mục"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={actionLoading}
            />
            <button onClick={handleAddCategory} disabled={actionLoading}>
              {actionLoading ? "Đang thêm..." : "Thêm danh mục"}
            </button>
          </div>

          <div className="item-list">
            <AnimatePresence>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  className="item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {editCategory && editCategory.id === category.id ? (
                    <div className="form-group">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={actionLoading}
                      />
                      <div className="item-actions">
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Đang lưu..." : "Lưu"}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => setEditCategory(null)}
                          disabled={actionLoading}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="item-content">{category.name}</span>
                      <div className="item-actions">
                        <button
                          onClick={() => handleEditCategory(category)}
                          disabled={actionLoading}
                        >
                          Sửa
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

export default CategoryList;
