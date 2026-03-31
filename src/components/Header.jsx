import { useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { LogOut, User } from "lucide-react";
import { AuthContext } from "../contexts/AuthProvider"; // 🔥 IMPORTANTE
import { formatarNome, getIniciais } from "../utils/user"; // 🔥 utils correto

export default function Header() {
  const { perfil } = useContext(AuthContext); // 🔥 agora sim correto
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 🔹 Resize responsivo
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Logout seguro
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload(); // 🔥 evita bug de sessão travada
  }

  // 🔹 Dados formatados
  const nome = formatarNome(perfil?.nome, perfil?.email);
  const iniciais = getIniciais(perfil?.nome, perfil?.email);

  return (
    <div style={styles.header}>
      
      {/* LOGO */}
      <div style={styles.logo}>
        🏛️ {!isMobile && "Sistema de Cemitério"}
      </div>

      {/* DIREITA */}
      {perfil && (
        <div style={styles.right}>

          {/* USER */}
          <div style={styles.user} onClick={() => setOpen(!open)}>
            
            <div style={styles.avatar}>
              {iniciais}
            </div>

            {!isMobile && (
              <span style={styles.nome}>
                {nome}
              </span>
            )}
          </div>

          {/* DROPDOWN */}
          {open && (
            <div style={styles.dropdown}>
              <div style={styles.item}>
                <User size={14} /> Perfil
              </div>

              <div style={styles.item} onClick={handleLogout}>
                <LogOut size={14} /> Sair
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    height: "60px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },

  logo: {
    fontWeight: "600",
    fontSize: "15px",
    color: "#111827"
  },

  right: {
    display: "flex",
    alignItems: "center",
    position: "relative"
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },

  nome: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151"
  },

  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
    minWidth: "140px"
  },

  item: {
    padding: "10px 12px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  }
};