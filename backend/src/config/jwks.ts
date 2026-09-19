import { createRemoteJWKSet } from "jose";
import { env } from "./env";

export const supabaseJWKS = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
