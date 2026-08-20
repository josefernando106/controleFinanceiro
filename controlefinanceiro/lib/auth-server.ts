import { NextRequest } from "next/server";
import { supabase } from "./supabase-server";

export type AuthUser = {
  id: string;
  email: string;
};

export async function getAuthUser(
  req: NextRequest
): Promise<{ user: AuthUser; token: string } | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return {
    user: { id: data.user.id, email: data.user.email! },
    token,
  };
}
