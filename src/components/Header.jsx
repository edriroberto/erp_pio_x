import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Sessão inicial

    // Listener auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Resize
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => {
      listener?.subscription?.unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🔹 Nome amigável
  function formatarNome(email) {
    if (!email) return "Usuário";
    const nome = email.split("@")[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }

  // 🔹 Iniciais
  function getIniciais(email) {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  }

  // 🔹 Logout
  async function handleLogout() {
    
    await supabase.auth.signOut();
setUser(null);
  }

  return (
    <div style={styles.header}>
      
      {/* LOGO */}
      <div style={styles.logo}>
        🏛️ {!isMobile && "Sistema de Cemitério"}
      </div>

      {/* DIREITA */}
      {user && (
        <div style={styles.right}>

          {/* USUÁRIO */}
          <div style={styles.user} onClick={() => setOpen(!open)}>
            
            <div style={styles.avatar}>
              {getIniciais(user.email)}
            </div>

            {!isMobile && (
              <span style={styles.nome}>
                {formatarNome(user.email)}
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