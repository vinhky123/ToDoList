import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoList from "./components/TodoList";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import NavBar from "./assets/NavBar";
import CategoriesList from "./assets/CategoriesList";
import Loader from "./components/Loader";
import axios from "axios";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const checkTokenSession = async () => {
    try {
      await axios.post(
        `/api/auth/me`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
      if (error.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    checkTokenSession();
  }, []);

  return (
    <Router>
      <div className="container">
        <NavBar
          token={token}
          handleLogout={handleLogout}
          setLoading={setLoading}
        />
        {loading ? <Loader /> : <></>}
        <div className="mainPage">
          {token && (
            <CategoriesList
              token={token}
              onCategorySelect={handleCategorySelect}
              setLoading={setLoading}
            />
          )}

          <RouteTransition>
            <Routes>
              <Route
                path="/login"
                element={<Login setToken={setToken} setLoading={setLoading} />}
              />
              <Route
                path="/register"
                element={
                  <Register setToken={setToken} setLoading={setLoading} />
                }
              />
              <Route
                path="/forget"
                element={<ForgetPassword setLoading={setLoading} />}
              />
              <Route
                path="/reset"
                element={<ResetPassword setLoading={setLoading} />}
              />
              <Route
                path="/todos"
                element={
                  token ? (
                    <TodoList
                      token={token}
                      selectedCategory={selectedCategory}
                    />
                  ) : (
                    <RedirectToLogin />
                  )
                }
              />
              <Route
                path="/"
                element={
                  <Home token={token} selectedCategory={selectedCategory} />
                }
              />
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

function Home({ token, selectedCategory }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
      }}
      className="welcome-message"
    >
      {!token ? (
        <h1>Chào mừng đến với ứng dụng To-Do List!</h1>
      ) : !selectedCategory ? (
        <h1>Chọn 1 danh mục hoặc tạo mới</h1>
      ) : (
        <TodoList token={token} selectedCategory={selectedCategory} />
      )}
    </div>
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
