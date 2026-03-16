import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(res => setUser(res.data.session?.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div
      style={{
        marginBottom: 0,
        background: "#f3f4f6",
        padding: "15px 20px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong>Sistema de Gestão de Cemitério</strong>
      {user && <span style={{ fontSize: 14, color: "#333" }}>Logado como: {user.email}</span>}
    </div>
  );
}