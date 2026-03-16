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

    // Pega o usuário logado
    supabase.auth.getSession().then(res => setUser(res.data.session?.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const estiloPC = {
    container: {
      width: 260,
      minWidth: 260,
      background: "#2f3542",
      color: "#fff",
      height: "100vh",
      padding: 20,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    item: {
      display: "block",
      padding: "10px",
      color: "#fff",
      textDecoration: "none",
      borderRadius: 4,
      marginBottom: 5,
    },
    ativo: { background: "#57606f" },
    usuario: { marginBottom: 20, fontSize: 14, fontWeight: 500, color: "#f1f2f6" },
    logout: {
      padding: 10,
      background: "#ea4335",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
      marginTop: 10,
    },
  };

  if (isMobile) {
    return (
      <nav className="nav-mobile-bottom">
        <NavLink to="/" className="mobile-link">
          🏠<span>Início</span>
        </NavLink>
        <NavLink to="/sepultamentos" className="mobile-link">
          ⚰️<span>Sepultar</span>
        </NavLink>
        <NavLink to="/quadras" className="mobile-link">
          🗺️<span>Quadras</span>
        </NavLink>
        <button onClick={handleLogout} className="mobile-link" style={{ color: "red" }}>
          🚪<span>Sair</span>
        </button>
      </nav>
    );
  }

  return (
    <aside style={estiloPC.container} className="sidebar-desktop">
      <div>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 30 }}>ERP Cemitério</div>
        {user && <div style={estiloPC.usuario}>👤 {user.email}</div>}
        <nav style={{ display: "flex", flexDirection: "column" }}>
          <NavLink to="/" style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}>
            Início
          </NavLink>
          <NavLink to="/sepultamentos" style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}>
            Sepultamentos
          </NavLink>
          <NavLink
            to="/sepultamentos-nome"
            style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}
          >
            Por nome
          </NavLink>
          <NavLink
            to="/sepultamentos-periodo"
            style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}
          >
            Por período
          </NavLink>
          <NavLink to="/quadras" style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}>
            Quadras e Lotes
          </NavLink>
          <NavLink to="/funerarias" style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}>
            Funerárias
          </NavLink>
          <NavLink to="/coveiros" style={({ isActive }) => ({ ...estiloPC.item, ...(isActive ? estiloPC.ativo : {}) })}>
            Coveiros
          </NavLink>
        </nav>
      </div>
      <button onClick={handleLogout} style={estiloPC.logout}>
        Sair
      </button>
    </aside>
  );
}