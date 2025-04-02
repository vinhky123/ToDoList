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
import NavBar from "./assets/NavBar";
import CategoriesList from "./assets/CategoriesList";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <Router>
      <div className="container">
        <NavBar token={token} handleLogout={handleLogout}></NavBar>
        <div className="mainPage">
          <CategoriesList></CategoriesList>
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
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="content"
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
