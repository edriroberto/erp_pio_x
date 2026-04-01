import { useState, useEffect, useContext, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { LogOut } from "lucide-react";
import { AuthContext } from "../contexts/AuthProvider";
import Avatar from "../components/Avatar";

export default function Header() {
  const { perfil, user, refreshPerfil } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // UseCallback evita que a função seja recriada a cada render
  const handleUploadSuccess = useCallback(async () => {
    if (refreshPerfil) await refreshPerfil();
    setOpen(false); // Fecha o menu com segurança
  }, [refreshPerfil]);

  const getNome = () => {
    if (perfil?.nome) return perfil.nome;
    const emailNome = perfil?.email?.split("@")[0] || "Usuário";
    return emailNome.charAt(0).toUpperCase() + emailNome.slice(1);
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        🏛️ <span style={styles.logoText}>Gestão de Cemitérios</span>
      </div>

      {perfil && (
        <div style={styles.right}>
          {/* GATILHO */}
          <div
            style={styles.userTrigger}
            onClick={() => setOpen(!open)}
          >
            <Avatar perfil={perfil} user={user} size={32} editable={false} />
            {!isMobile && <span style={styles.nome}>{getNome()}</span>}
          </div>

          {/* DROPDOWN */}
          {open && (
            <>
              <div style={styles.overlay} onClick={() => setOpen(false)} />
              <div style={styles.dropdown}>
                <div style={styles.userInfo}>
                  <Avatar 
                    perfil={perfil} 
                    user={user} 
                    size={64} 
                    editable={true} 
                    onUploadSuccess={async () => {
                    console.log("Upload concluído, fechando menu...");
                    if (refreshPerfil) await refreshPerfil();
                    setOpen(false); // 🔥 Força o fechamento do estado local
                  }}
                  />
                  <strong style={styles.userName}>{getNome()}</strong>
                  <span style={styles.userEmail}>{perfil?.email}</span>
                </div>

                <div style={styles.divider} />

                <button 
                  style={styles.itemDanger} 
                  onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
                >
                  <LogOut size={14} /> Sair do Sistema
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    height: "60px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },
  logo: { display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "18px" },
  logoText: { color: "#111827" },
  right: { position: "relative" },
  userTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "4px 12px",
    borderRadius: "24px",
    border: "1px solid #f3f4f6",
    background: "#f9fafb"
  },
  nome: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  overlay: { position: "fixed", inset: 0, zIndex: 999 },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    minWidth: "240px",
    zIndex: 1000,
    padding: "8px 0",
    border: "1px solid #eee"
  },
  userInfo: { padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
  userName: { marginTop: "10px", fontSize: "14px", color: "#111827" },
  userEmail: { fontSize: "12px", color: "#6b7280" },
  divider: { height: "1px", background: "#f1f5f9", margin: "8px 0" },
  itemDanger: {
    width: "100%",
    border: "none",
    background: "none",
    padding: "12px 16px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    color: "#ef4444",
    textAlign: "left"
  }
};