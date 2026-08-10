import { Router, Response } from "express";
import { supabaseAdmin } from "../utils/supabase";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/transacoes
router.get("/", async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from("transacoes")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("data_vencimento", { ascending: false });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ transacoes: data });
});

// POST /api/transacoes
router.post("/", async (req: AuthRequest, res: Response) => {
  const {
    descricao,
    valor,
    tipo,
    recorrencia,
    is_paid,
    data_vencimento,
    data_pagamento,
  } = req.body;

  if (!descricao || valor == null || !tipo || !data_vencimento) {
    res.status(400).json({
      error: "Descrição, valor, tipo e data de vencimento são obrigatórios",
    });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("transacoes")
    .insert({
      user_id: req.user!.id,
      descricao,
      valor,
      tipo,
      recorrencia: recorrencia ?? "unica",
      is_paid: is_paid ?? false,
      data_vencimento,
      data_pagamento,
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ transacao: data });
});

// PUT /api/transacoes/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const {
    descricao,
    valor,
    tipo,
    recorrencia,
    is_paid,
    data_vencimento,
    data_pagamento,
  } = req.body;

  const { data, error } = await supabaseAdmin
    .from("transacoes")
    .update({
      descricao,
      valor,
      tipo,
      recorrencia,
      is_paid,
      data_vencimento,
      data_pagamento,
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
    res.status(404).json({ error: "Transação não encontrada" });
    return;
  }

  res.json({ transacao: data });
});

// DELETE /api/transacoes/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { error, count } = await supabaseAdmin
    .from("transacoes")
    .delete({ count: "exact" })
    .eq("id", req.params.id)
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!count) {
    res.status(404).json({ error: "Transação não encontrada" });
    return;
  }

  res.status(204).send();
});

export default router;
