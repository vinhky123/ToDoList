import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import categoryRoutes from "./routes/categories.js";
import tagRoutes from "./routes/tags.js";
import logRequestResponse from "./middleware/logRequestResponse.js";

dotenv.config();

const app = express();
const { Pool } = pkg;

app.use(cors());
app.use(express.json());
app.use(logRequestResponse);

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: 5432,
});

async function connectPool() {
  try {
    await pool.connect();
    console.log("Kết nối DB mượt");
  } catch (err) {
    console.log(`Lỗi khi kết nối DB: ${err}`);
  }
}

connectPool();

app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);

app.get("/", (req, res) => {
  res.send("Connect thành công tới backend");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server đang chạy ở port ${PORT}`));
