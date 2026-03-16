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
    { to: "/quadras", label: "Quadras e Lotes", icon: "🗺️" },
    { to: "/funerarias", label: "Funerárias", icon: "🏢" },
    { to: "/coveiros", label: "Coveiros", icon: "🧑‍🌾" },
  ];

  const sidebarStyle = {
    width: 260,
    minWidth: 260,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: 20,
    background: "#2f3542",
    color: "#fff",
    boxSizing: "border-box", // ADICIONE ISSO: impede que o padding "estique" a sidebar
  };

  const navStyle = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: 5,
    overflowY: "auto",
  };

  const itemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 15px",
    borderRadius: 4,
    textDecoration: "none",
    color: "#fff",
    background: isActive ? "#57606f" : "transparent",
  });

  const userStyle = {
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
    color: "#f1f2f6",
  };

  const logoutStyle = {
    padding: 10,
    background: "#ea4335",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    width: "100%",
    marginTop: "auto", // garante que fique fixo na parte inferior
  };

  if (isMobile) {
    return (
      <nav className="nav-mobile-bottom" style={{ display: "flex", justifyContent: "space-around" }}>
        {navLinks.slice(0, 3).map((link) => (
          <NavLink key={link.to} to={link.to} className="mobile-link">
            {link.icon} <span>{link.label}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} className="mobile-link" style={{ color: "red" }}>
          🚪 <span>Sair</span>
        </button>
      </nav>
    );
  }

  return (
    <aside style={sidebarStyle}>
      <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 30 }}>ERP Cemitério</div>
      {user ? <div style={userStyle}>👤 {user.email}</div> : <div style={userStyle}>🔒 Não logado</div>}
      <nav style={navStyle}>
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => itemStyle(isActive)}>
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} style={logoutStyle}>
        Sair
      </button>
    </aside>
  );
}