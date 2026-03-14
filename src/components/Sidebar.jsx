import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const estiloPC = {
    container: { width: 260, minWidth: 260, background: "#2f3542", color: "#fff", height: "100vh", padding: 20, flexShrink: 0 },
    item: { display: "block", padding: "10px", color: "#fff", textDecoration: "none", borderRadius: 4, marginBottom: 5 },
    ativo: { background: "#57606f" }
  };

  if (isMobile) {
    return (
      <nav className="nav-mobile-bottom">
        <NavLink to="/" className="mobile-link">🏠<span>Início</span></NavLink>
        <NavLink to="/sepultamentos" className="mobile-link">⚰️<span>Sepultar</span></NavLink>
        <NavLink to="/quadras" className="mobile-link">🗺️<span>Quadras</span></NavLink>
      </nav>
    );
  }

  return (
    <aside style={estiloPC.container} className="sidebar-desktop">
      <div style={{fontSize: 20, fontWeight: 'bold', marginBottom: 30}}>ERP Cemitério</div>
      <nav style={{display: 'flex', flexDirection: 'column'}}>
        <NavLink to="/" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Início</NavLink>
        <NavLink to="/sepultamentos" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Sepultamentos</NavLink>
        <NavLink to="/sepultamentos-nome" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Por nome</NavLink>
        <NavLink to="/sepultamentos-periodo" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Por Período</NavLink>
        <NavLink to="/quadras" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Quadras e Lotes</NavLink>
        <NavLink to="/funerarias" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Funerárias</NavLink>
        <NavLink to="/coveiros" style={({isActive}) => ({...estiloPC.item, ...(isActive ? estiloPC.ativo : {})})}>Coveiros</NavLink>
      </nav>
    </aside>
  );
}