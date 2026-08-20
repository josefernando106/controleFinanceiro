import { NextRequest } from "next/server";
import { supabase } from "./supabase-server";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "membro";
  ownerId: string | null;
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

  const metadata = data.user.user_metadata ?? {};
  const role: "admin" | "membro" = metadata.role === "membro" ? "membro" : "admin";
  const ownerId = typeof metadata.owner_id === "string" ? metadata.owner_id : null;

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: metadata.name,
      role,
      ownerId,
    },
    token,
  };
}

// Contas/transações/categorias são compartilhadas por toda a família: um
// "membro" enxerga e grava os mesmos dados do "admin" que o criou.
export function getFamilyId(user: AuthUser): string {
  return user.role === "membro" && user.ownerId ? user.ownerId : user.id;
}
