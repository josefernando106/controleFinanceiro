import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (token) {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ message: "Logout realizado com sucesso" });
}
