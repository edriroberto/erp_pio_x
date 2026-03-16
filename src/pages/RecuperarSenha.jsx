import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRecuperar(e) {
    e.preventDefault();
    setMessage("");
    if (!email) {
      setMessage("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);

    if (error) setMessage(error.message);
    else setMessage("Link de recuperação enviado para seu e-mail.");
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f6fa",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleRecuperar}
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
        <h2 style={{ textAlign: "center" }}>Recuperar Senha</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
        />
        {message && (
          <div
            style={{
              color: message.includes("enviado") ? "green" : "red",
              fontSize: "0.9rem",
            }}
          >
            {message}
          </div>
        )}
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
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </div>
  );
}