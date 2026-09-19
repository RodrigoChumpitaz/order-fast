import { env } from "./env";

export async function broadcastRealtimeEvent(topic: string, event: string, payload: Record<string, unknown>) {
  const response = await fetch(`${env.SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: [{ topic, event, payload }] }),
  });

  if (!response.ok) {
    throw new Error(`Realtime broadcast falló con status ${response.status}`);
  }
}
