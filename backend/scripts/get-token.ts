import { env } from "../src/config/env";

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Uso: npm run get-token -- <email> <password>");
    process.exit(1);
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`Error: ${data.error_description ?? data.msg ?? JSON.stringify(data)}`);
    process.exit(1);
  }

  console.log(data.access_token);
}

main();
