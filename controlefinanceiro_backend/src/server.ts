import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import contasRoutes from "./routes/contas";
import transacoesRoutes from "./routes/transacoes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/contas", contasRoutes);
app.use("/api/transacoes", transacoesRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
