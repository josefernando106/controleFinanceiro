import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { supabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);

  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase.auth.getUser(auth.token);

  if (error || !data.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      created_at: data.user.created_at,
    },
  });
}
