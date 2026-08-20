import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth-server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const { id } = await params;
  const { nome, tipo, saldo_inicial, cor } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("contas")
    .update({
      nome,
      tipo,
      saldo_inicial,
      cor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ conta: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const { id } = await params;

  const { error, count } = await supabaseAdmin
    .from("contas")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!count) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
