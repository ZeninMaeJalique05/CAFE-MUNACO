import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import customerRoutes from "./routes/customerRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/api/customer", customerRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? err.sqlMessage || err.message : err.message,
  });
});

const PORT = process.env.PORT || 5000;

db.getConnection()
  .then((conn) => {
    conn.release();
    console.log("MySQL connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("DB connection failed:", err.message));