import { Router, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/contas
router.get("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("contas")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ contas: data });
});

// POST /api/contas
router.post("/", async (req: AuthRequest, res: Response) => {
  const { nome, tipo, saldo_inicial, cor } = req.body;

  if (!nome || !tipo) {
    res.status(400).json({ error: "Nome e tipo são obrigatórios" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("contas")
    .insert({
      user_id: req.user!.id,
      nome,
      tipo,
      saldo_inicial: saldo_inicial ?? 0,
      cor,
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ conta: data });
});

// PUT /api/contas/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { nome, tipo, saldo_inicial, cor } = req.body;

  const { data, error } = await supabaseAdmin
    .from("contas")
    .update({
      nome,
      tipo,
      saldo_inicial,
      cor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .eq("user_id", req.user!.id)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: "Conta não encontrada" });
    return;
  }

  res.json({ conta: data });
});

// DELETE /api/contas/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { error, count } = await supabaseAdmin
    .from("contas")
    .delete({ count: "exact" })
    .eq("id", req.params.id)
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!count) {
    res.status(404).json({ error: "Conta não encontrada" });
    return;
  }

  res.status(204).send();
});

export default router;
