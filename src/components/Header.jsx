import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Listener para o usuário
    supabase.auth.getSession().then(res => setUser(res.data.session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Listener para redimensionamento de tela
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        marginBottom: 0,
        background: "#f3f4f6",
        padding: isMobile ? "10px 15px" : "15px 20px", // Padding reduzido no mobile
        borderBottom: "1px solid #ddd",
        display: "flex",
        // No mobile vira coluna, no desktop mantém linha
        flexDirection: isMobile ? "column" : "row",
        // No mobile alinha à esquerda, no desktop separa os itens
        justifyContent: isMobile ? "flex-start" : "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? "4px" : "0",
      }}
    >
      <strong style={{ fontSize: isMobile ? "16px" : "18px" }}>
        Sistema de Gestão de Cemitério
      </strong>
      
      {user && (
        <span style={{ 
          fontSize: 11, 
          color: "#555",
          // Remove o "Logado como:" apenas no mobile se desejar, ou mantém conforme abaixo
          fontWeight: isMobile ? "normal" : "normal" 
        }}>
          {isMobile ? user.email : `Logado como: ${user.email}`}
        </span>
      )}
    </div>
  );
}