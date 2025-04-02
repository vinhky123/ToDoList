import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/categories.css";

function CategoriesList({ token }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lấy danh sách categories từ API
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data || [{ id: "default", name: "Mặc định" }]); // Category mặc định nếu API chưa có
      } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  // Thêm category mới
  const handleAddCategory = async () => {
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
      console.error("Lỗi khi thêm category:", error);
    }
  };

  return (
    <div className="categories-sidebar">
      <h3>Danh mục</h3>
      <div className="category-input">
        <input
          type="text"
          placeholder="Tên danh mục mới"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Thêm</button>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id}>
              <Link to={`/todos?category=${category.id}`}>{category.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoriesList;
