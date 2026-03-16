import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setError(error.message);
    else navigate("/dashboard");
  }

  return (
    <form
      onSubmit={handleLogin}
      style={{
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        gap: 15,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
      />
      {error && <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: 12,
          borderRadius: 6,
          border: "none",
          background: "#4a90e2",
          color: "#fff",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Entrando..." : "Login"}
      </button>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: "0.9rem" }}>
        <a href="/recuperar-senha">Esqueceu a senha?</a>
      </div>
    </form>
  );
}