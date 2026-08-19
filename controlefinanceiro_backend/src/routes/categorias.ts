import { Router, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/categorias
router.get("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("nome", { ascending: true });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ categorias: data });
});

// POST /api/categorias
router.post("/", async (req: AuthRequest, res: Response) => {
  const { nome, cor } = req.body;

  if (!nome) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .insert({
      user_id: req.user!.id,
      nome,
      cor,
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ categoria: data });
});

// PUT /api/categorias/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { nome, cor } = req.body;

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .update({
      nome,
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
    res.status(404).json({ error: "Categoria não encontrada" });
    return;
  }

  res.json({ categoria: data });
});

// DELETE /api/categorias/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { error, count } = await supabaseAdmin
    .from("categorias")
    .delete({ count: "exact" })
    .eq("id", req.params.id)
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!count) {
    res.status(404).json({ error: "Categoria não encontrada" });
    return;
  }

  res.status(204).send();
});

export default router;
