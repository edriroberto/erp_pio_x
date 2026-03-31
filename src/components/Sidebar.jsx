import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../Hooks/useAuth"; // Hook de segurança
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
  User,
  MapPin,
  Loader2
} from "lucide-react";

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { perfil, loading } = useAuth(); // Pegamos o nível de acesso real do banco
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // --- DEFINIÇÃO DE LINKS COM PERMISSÕES ---
  // Adicionamos a propriedade 'niveis' para cada rota
  const navLinks = [
    { to: "/", label: "Início", icon: Home, niveis: ['consulta', 'admin', 'master'] },
    { to: "/sepultamentos", label: "Registros", icon: UserPlus, niveis: ['admin', 'master'] },
    { to: "/sepultamentos-nome", label: "Busca Nome", icon: Search, niveis: ['consulta', 'admin', 'master'] },
    { to: "/sepultamentos-periodo", label: "Período", icon: Calendar, niveis: ['consulta', 'admin', 'master'] },
    { to: "/sepultamentos-lote", label: "Busca por Lotes", icon: MapPin, niveis: ['consulta', 'admin', 'master'] },
    { to: "/quadras", label: "Quadras", icon: LayoutGrid, niveis: ['admin', 'master'] },
    { to: "/funerarias", label: "Funerárias", icon: Building2, niveis: ['admin', 'master'] },
    { to: "/coveiros", label: "Coveiros", icon: UserRound, niveis: ['admin', 'master'] },
    { to: "/exumacoes", label: "Exumar", icon: Archive, niveis: ['master'] },
    { to: "/relatorioexumacoes", label: "Relatórios", icon: FileSearch, niveis: ['master'] },
    { to: "/usuarios", label: "Usuários", icon: FileSearch, niveis: ['master'] }
  ];

  // Filtra os links que o usuário atual PODE ver
  const linksPermitidos = navLinks.filter(link => 
    perfil && link.niveis.includes(perfil.nivel)
  );

  // Estado de carregamento para evitar "pulo" de interface
  if (loading) {
    return (
      <aside style={{...styles.sidebar, justifyContent: 'center', alignItems: 'center'}}>
        <Loader2 className="animate-spin" color="#4fd1c5" />
      </aside>
    );
  }

  // --- RENDERIZAÇÃO MOBILE ---
  if (isMobile) {

    
    return (
          <nav style={styles.mobileNav}>
          {/* LÓGICA DINÂMICA:
              Se for Master: Mostra 0, 1, 5, 8, 9
              Se NÃO for Master: Mostra apenas 0 e 2 (Início e Busca Nome)
          */}
          {linksPermitidos
            .filter((_, index) => {
              if (perfil?.nivel === 'master') {
                // Atalhos de poder para você
                return [0, 1, 5, 8, 9].includes(index);
              } else {
                // Atalhos simplificados para colegas/coveiros
                return [0, 1].includes(index);
              }
            })
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
            <LogOut size={22} />
            <span>Sair</span>
          </button>
        </nav>
    );
  }

  // --- RENDERIZAÇÃO DESKTOP ---
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏛️</div>
         <div style={styles.logo}>
        Gestão
      </div>
      </div>
      
      <div style={styles.userInfo}>
      
      {/* 🔹 NOME DO USUÁRIO */}
      <span style={styles.userName}>
        {perfil?.nome || perfil?.email?.split("@")[0]}
      </span>

      {/* 🔹 NÍVEL */}
       <span style={styles.userLevel}>
        {perfil?.nivel || "visitante"}
      </span>

      
      

    </div>

      <nav style={styles.desktopNav}>
        {linksPermitidos.map((link) => {
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
        Encerrar Sessão
      </button>
    </aside>
  );
}

// --- ESTILOS (Mantidos e Otimizados) ---
const styles = {
  mobileNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    background: "rgba(26, 32, 44, 0.98)",
    backdropFilter: "blur(15px)",
    display: "flex", 
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: "env(safe-area-inset-bottom)", 
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 1000,
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
    width: "20px",
    height: "3px",
    background: "#4fd1c5",
    borderRadius: "0 0 4px 4px",
  },
  mobileLogout: {
    background: "none", 
    border: "none", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    color: "#d3cfcf",
    fontSize: "9px",
    gap: "5px",
    flex: 1
  },

  sidebar: {
    width: 260,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "5px 15px",
    background: "#0b1f17", // 🔥 verde quase preto
    color: "#fff",
    boxSizing: "border-box",
    borderRight: "1px solid #2d3748"
  },

  logo: {
    color: "#b1f0d3",
    fontSize: "20px",
    alignItems: "center",
    display: "flex",
    justifyContent: "center", // 🔥 centraliza horizontal
    alignItems: "center",     // 🔥 centraliza vertical

    whiteSpace: "nowrap",
    width: "60%",
  //  marginBottom: "20px"

  
  },

  logoIcon: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  width: "40px",
  height: "40px",
  borderRadius: "6px"
  },

  userInfo: {
    marginBottom: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "8px"
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
    padding: "12px",
    background: "rgba(234, 67, 53, 0.1)",
    color: "#f8f8f8",
    border: "1px solid rgba(199, 197, 196, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  userName: {
  fontSize: "13px",
  fontWeight: "600",
  color: "#ecfdf5", // 🔥 branco esverdeado
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
},

userLevel: {
  fontSize: "10px",           // 🔥 pequeno
  color: "#dde0de",           // verde suave (não grita)
  opacity: 0.7,               // 🔥 discreto
  textTransform: "capitalize",// master → Master
  letterSpacing: "0.5px"
},
};