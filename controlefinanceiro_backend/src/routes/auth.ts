import { Router, Request, Response } from "express";
import { supabase } from "../../utils/supabase";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = Router();

// POST /api/auth/cadastro
router.post("/cadastro", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({
    user: {
      id: data.user?.id,
      email: data.user?.email,
      name,
    },
    session: data.session,
  });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json({ error: "E-mail ou senha inválidos" });
    return;
  }

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
  });
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token) {
    await supabase.auth.signOut();
  }

  res.json({ message: "Logout realizado com sucesso" });
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase.auth.getUser(
    req.headers.authorization!.split(" ")[1]
  );

  if (error || !data.user) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      created_at: data.user.created_at,
    },
  });
});

export default router;
