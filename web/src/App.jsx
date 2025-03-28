import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoList from "./components/TodoList";
import CategoryList from "./components/CategoryList";
import TagList from "./components/TagList";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <Router>
      <div className="container">
        <nav>
          {token ? (
            <>
              <Link to="/todos">Công việc</Link>
              <Link to="/categories">Danh mục</Link>
              <Link to="/tags">Tags</Link>
              <button onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
              <Link to="/forget">Quên mật khẩu</Link>
            </>
          )}
        </nav>

        <RouteTransition>
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route
              path="/register"
              element={<Register setToken={setToken} />}
            />
            <Route path="/forget" element={<ForgetPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route
              path="/todos"
              element={token ? <TodoList /> : <RedirectToLogin />}
            />
            <Route
              path="/categories"
              element={token ? <CategoryList /> : <RedirectToLogin />}
            />
            <Route
              path="/tags"
              element={token ? <TagList /> : <RedirectToLogin />}
            />
            <Route path="/" element={<Home token={token} />} />
          </Routes>
        </RouteTransition>
      </div>
    </Router>
  );
}

function RouteTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="page"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Home({ token }) {
  return (
    <h1>
      {token
        ? "Chào mừng đến với ứng dụng To-Do List!"
        : "Vui lòng đăng nhập để tiếp tục"}
    </h1>
  );
}

function RedirectToLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
  }, [navigate]);
  return null;
}

export default App;
