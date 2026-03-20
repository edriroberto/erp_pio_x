import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { 
  Home, 
  UserPlus, 
  Search, 
  Calendar, 
  LayoutGrid, 
  Building2, 
  UserRound, 
  Archive, 
  FileSearch, 
  LogOut,
  User
} from "lucide-react";

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Definição moderna de ícones com Lucide
  const navLinks = [
    { to: "/", label: "Início", icon: Home },
    { to: "/sepultamentos", label: "Registros", icon: UserPlus },
    { to: "/sepultamentos-nome", label: "Busca Nome", icon: Search },
    { to: "/sepultamentos-periodo", label: "Período", icon: Calendar },
    { to: "/quadras", label: "Quadras", icon: LayoutGrid },
    { to: "/funerarias", label: "Funerárias", icon: Building2 },
    { to: "/coveiros", label: "Coveiros", icon: UserRound },
    { to: "/exumacoes", label: "Exumar", icon: Archive },
    { to: "/relatorioexumacoes", label: "Relatórios", icon: FileSearch }
  ];

  // --- RENDERIZAÇÃO MOBILE (Bottom Navigation 2026) ---
  if (isMobile) {
    return (
      <nav style={styles.mobileNav}>
        {navLinks
          .filter((_, index) => [0, 1, 4, 8].includes(index))
          .map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                style={{
                  ...styles.mobileItem,
                  color: isActive ? "#4fd1c5" : "#a4b0be"
                }}
              >
                {isActive && <div style={styles.activeIndicator} />}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontWeight: isActive ? "700" : "500" }}>{link.label}</span>
              </NavLink>
            );
          })} 
        
        <button onClick={handleLogout} style={styles.mobileLogout}>
          <LogOut size={22} strokeWidth={1.8} />
          <span>Sair</span>
        </button>
      </nav>
    );
  }

  // --- RENDERIZAÇÃO DESKTOP (Modern Sidebar) ---
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>G</div>
        <span>ERP CEMITÉRIO</span>
      </div>
      
      {user ? (
        <div style={styles.userInfo}>
          <User size={16} color="#55efc4" />
          <span>{user.email.split('@')[0].toUpperCase()}</span>
        </div>
      ) : (
        <div style={styles.userInfo}>🔒 ACESSO RESTRITO</div>
      )}

      <nav style={styles.desktopNav}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              style={{
                ...styles.desktopItem,
                background: isActive ? "rgba(79, 209, 197, 0.1)" : "transparent",
                color: isActive ? "#4fd1c5" : "#f1f2f6",
                borderLeft: isActive ? "4px solid #4fd1c5" : "4px solid transparent"
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button onClick={handleLogout} style={styles.logoutButton}>
        <LogOut size={18} />
        Sair do Sistema
      </button>
    </aside>
  );
}

// --- SISTEMA DE ESTILOS ---
const styles = {
  // MOBILE
  mobileNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    background: "rgba(26, 32, 44, 0.96)",
    backdropFilter: "blur(10px)",
    display: "flex", 
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: "env(safe-area-inset-bottom)", 
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 1000,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.3)"
  },
  mobileItem: {
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    textDecoration: "none",
    fontSize: "9px",
    gap: "5px",
    position: "relative",
    flex: 1
  },
  activeIndicator: {
    position: "absolute",
    top: "-15px",
    width: "15px",
    height: "3px",
    background: "#4fd1c5",
    borderRadius: "0 0 4px 4px",
    boxShadow: "0 2px 10px rgba(79, 209, 197, 0.6)"
  },
  mobileLogout: {
    background: "none", 
    border: "none", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    color: "#ff7675",
    fontSize: "9px",
    gap: "5px",
    flex: 1
  },

  // DESKTOP
  sidebar: {
    width: 260,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "25px 15px",
    background: "#1a202c",
    color: "#fff",
    boxSizing: "border-box",
    borderRight: "1px solid #2d3748"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "30px",
    color: "#4fd1c5"
  },
  logoIcon: {
    background: "#4fd1c5",
    color: "#1a202c",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px"
  },
  userInfo: {
    marginBottom: "25px",
    fontSize: "11px",
    color: "#a0aec0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 10px"
  },
  desktopNav: {
    display: "flex", 
    flexDirection: "column", 
    gap: "4px", 
    flexGrow: 1, 
    overflowY: "auto" 
  },
  desktopItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.2s ease",
    borderRadius: "0 8px 8px 0"
  },
  logoutButton: {
    padding: "14px",
    background: "rgba(234, 67, 53, 0.1)",
    color: "#ea4335",
    border: "1px solid rgba(234, 67, 53, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    marginTop: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s"
  }
};