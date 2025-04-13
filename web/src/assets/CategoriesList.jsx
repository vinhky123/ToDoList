import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/categories.css";

function CategoriesList({ token, onCategorySelect, setLoading }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOpenAddCate, setIsOpenAddCate] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  const handleAddCategory = async () => {
    setError("");
    setLoading(true);
    if (!newCategory.trim()) return;
    try {
      const response = await axios.post(
        "/api/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, response.data]);
      setNewCategory("");
    } catch (error) {
      setError(error.response?.data?.error || "Lỗi không xác định");
      setNewCategory(""); // Đảm bảo reset ngay cả khi lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setError("");
    setLoading(true);
    try {
      await axios.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      setError(error.response?.data?.error || "Không thể xóa danh mục");
    } finally {
      setLoading(false);
    }
  };

  const categoriesItem = () => {
    if (categories.length === 0)
      return <p className="no-categories">Chưa có danh mục nào!</p>;
    return (
      <ul className="categories-list">
        {categories.map((category) => (
          <li
            key={category.id}
            className="category-item"
            onClick={() => {
              onCategorySelect(category);
              navigate("/");
            }}
          >
            <span className="category-name">{category.name}</span>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category.id);
              }}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const openAddCate = () => setIsOpenAddCate(!isOpenAddCate);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`categories-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <span className="hamburger-icon"></span>
      </button>
      {isSidebarOpen && (
        <>
          <h3>Danh mục</h3>
          {categoriesItem()}
          <button
            className={`add-button ${isOpenAddCate ? "open" : "closed"}`}
            onClick={openAddCate}
          >
            {isOpenAddCate ? "x" : "+"}
          </button>
          {isOpenAddCate && (
            <>
              <div className="add-category">
                <input
                  placeholder="Tên danh mục"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button onClick={handleAddCategory}>+</button>
              </div>
              <p className="error">{error}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CategoriesList;
