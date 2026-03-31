import { useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { LogOut, User } from "lucide-react";
import { AuthContext } from "../contexts/AuthProvider";

export default function Header() {
  const { perfil } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Nome (prioriza perfil.nome)
  function getNome() {
    if (perfil?.nome) return perfil.nome;

    if (perfil?.email) {
      const nome = perfil.email.split("@")[0];
      return nome.charAt(0).toUpperCase() + nome.slice(1);
    }

    return "Usuário";
  }

  // 🔹 Iniciais inteligentes
  function getIniciais() {
    if (perfil?.nome) {
      const partes = perfil.nome.split(" ");
      return (partes[0][0] + (partes[1]?.[0] || "")).toUpperCase();
    }

    if (perfil?.email) {
      return perfil.email.substring(0, 2).toUpperCase();
    }

    return "U";
  }

  // 🔹 Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div style={styles.header}>
      
      {/* LOGO */}
      <div style={styles.logo}>
        🏛️
        <span style={styles.logoText}>
          Gestão de Cemitérios
        </span>
      </div>

      {/* DIREITA */}
      {perfil && (
        <div style={styles.right}>

          {/* USUÁRIO */}
          <div style={styles.user} onClick={() => setOpen(!open)}>
            
            <div style={styles.avatar}>
              {getIniciais()}
            </div>

            {!isMobile && (
              <span style={styles.nome}>
                {getNome()}
              </span>
            )}
          </div>

          {/* DROPDOWN */}
          {open && (
            <div style={styles.dropdown}>
              
              <div style={styles.userInfo}>
                <strong>{getNome()}</strong>
                <span>{perfil?.email}</span>
              </div>

              <div style={styles.divider} />

              <div style={styles.item}>
                <User size={14} /> Perfil
              </div>

              <div style={styles.itemDanger} onClick={handleLogout}>
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
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    fontSize: "20px",
    color: "#111827"
  },

  logoText: {
    color: "#111827",
    whiteSpace: "nowrap"
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
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: "8px",
    transition: "background 0.2s"
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--jardim-acento)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600"
  },

  nome: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151"
  },

  dropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
    minWidth: "180px"
  },

  userInfo: {
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    fontSize: "12px",
    color: "#6b7280"
  },

  item: {
    padding: "10px 12px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#374151"
  },

  itemDanger: {
    padding: "10px 12px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "var(--jardim-pronto)"
  },

  divider: {
    height: "1px",
    background: "#f1f5f9"
  }
};