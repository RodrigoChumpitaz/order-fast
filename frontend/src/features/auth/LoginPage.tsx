import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { error } =
        mode === "signIn"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      await refreshProfile();
      navigate("/carta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">
        {mode === "signIn" ? "Ingresar" : "Crear cuenta"}
      </h1>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Correo</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Contraseña</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      {errorMessage && <p className="text-sm text-status-cancelled">{errorMessage}</p>}
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Un momento..." : mode === "signIn" ? "Ingresar" : "Crear cuenta"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        className="text-sm text-muted underline"
      >
        {mode === "signIn" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Ingresar"}
      </button>
    </div>
  );
}
