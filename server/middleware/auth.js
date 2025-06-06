import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log(token);

  if (!token) return res.status(401).json({ error: "Không tìm thấy token!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};
