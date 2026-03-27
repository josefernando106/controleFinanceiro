import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
