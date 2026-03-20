import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const navLinks = [
    { to: "/", label: "Início", icon: "🏠" },
    { to: "/sepultamentos", label: "Sepultamentos", icon: "⚰️" },
    { to: "/sepultamentos-nome", label: "Por nome", icon: "🔍" },
    { to: "/sepultamentos-periodo", label: "Por período", icon: "📅" },
    { to: "/quadras", label: "Quadras", icon: "🗺️" },
    { to: "/funerarias", label: "Funerárias", icon: "🏢" },
    { to: "/coveiros", label: "Coveiros", icon: "🧑‍🌾" },
    { to: "/exumacoes", label: "Exumações", icon: "🦴" },
    { to: "/relatorioexumacoes", label: "Relatório de Exumações", icon: "🦴" },
  ];

  // --- ESTILOS DESKTOP ---
  const sidebarStyle = {
    width: 260,
    minWidth: 260,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: 20,
    background: "#2f3542",
    color: "#fff",
    boxSizing: "border-box",
  };

  const itemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 15px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#fff",
    background: isActive ? "#57606f" : "transparent",
    transition: "background 0.2s",
  });

  const logoutStyleDesktop = {
    padding: "12px",
    background: "#ea4335", // Fundo vermelho sólido original
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    marginTop: "auto",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  };

  // --- RENDERIZAÇÃO MOBILE ---
  if (isMobile) {
    return (
      <nav 
        style={{ 
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65px",
          background: "#1e222d",
          display: "flex", 
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 10px",
          borderTop: "1px solid #3d4455",
          zIndex: 1000,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.2)"
        }}
      >
        {navLinks
          .filter((_, index) => [0, 1, 4, 8].includes(index))
          .map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              style={({ isActive }) => ({
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textDecoration: "none",
                color: isActive ? "#54a0ff" : "#a4b0be",
                fontSize: "10px",
                gap: "4px"
              })}
            >
              <span style={{ fontSize: "20px" }}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}     
        
        <button 
          onClick={handleLogout} 
          style={{ 
            background: "none", 
            border: "none", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            color: "#ff7675",
            gap: "4px"
          }}
        >
          <span style={{ fontSize: "20px" }}>🚪</span>
          <span style={{ fontSize: "10px" }}>Sair</span>
        </button>
      </nav>
    );
  }

  // --- RENDERIZAÇÃO DESKTOP ---
  return (
    <aside style={sidebarStyle}>
      <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 30, color: "#fff" }}>
        ERP Cemitério
      </div>
      
      {user ? (
        <div style={{ marginBottom: 20, fontSize: 13, color: "#f1f2f6", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, background: "#55efc4", borderRadius: "50%" }}></div>
          {user.email.split('@')[0]}
        </div>
      ) : (
        <div style={{ marginBottom: 20, color: "#ced4da" }}>🔒 Não logado</div>
      )}

      <nav style={{ display: "flex", flexDirection: "column", gap: 5, flexGrow: 1, overflowY: "auto" }}>
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => itemStyle(isActive)}>
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={logoutStyleDesktop}>
        
        Sair da conta
      </button>
    </aside>
  );
}