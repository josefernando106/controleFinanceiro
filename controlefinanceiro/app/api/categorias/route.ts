import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("nome", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ categorias: data });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const { nome, cor } = await req.json();

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .insert({
      user_id: auth.user.id,
      nome,
      cor,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ categoria: data }, { status: 201 });
}
