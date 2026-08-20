import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  // Quem se cadastra publicamente vira o "admin" da própria família —
  // membros só são criados depois, pelo admin, em /dashboard/usuarios.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "admin" },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
        role: "admin",
      },
      session: data.session,
    },
    { status: 201 }
  );
}
