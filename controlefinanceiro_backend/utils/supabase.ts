import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Cliente público — usa para operações de auth (login, cadastro)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin — usa para operações que precisam de acesso elevado
// Descomente quando tiver a service role key configurada
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
