import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Grid, FileText, LogOut } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Início', icon: Home },
    { path: '/sepultamentos', label: 'Registros', icon: Users },
    { path: '/quadras', label: 'Mapa/Quadras', icon: Grid },
    { path: '/relatorioexumacoes', label: 'Exumações', icon: FileText },
  ];

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navContent}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                color: isActive ? '#4fd1c5' : '#718096', // Teal para ativo, cinza para inativo
              }}
            >
              <div style={isActive ? styles.activeIndicator : styles.inactiveIndicator} />
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 1.8} 
                style={{ transition: 'all 0.3s ease' }}
              />
              <span style={{
                ...styles.label,
                fontWeight: isActive ? '700' : '500',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Botão Sair - Estilizado separadamente */}
        <button 
          onClick={() => { /* sua lógica de logout */ }} 
          style={{ ...styles.navItem, color: '#f56565' }}
        >
          <div style={styles.inactiveIndicator} />
          <LogOut size={24} strokeWidth={1.8} />
          <span style={styles.label}>Sair</span>
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75px',
    backgroundColor: 'rgba(26, 32, 44, 0.95)', // Fundo escuro com leve transparência
    backdropFilter: 'blur(10px)', // Efeito Glassmorphism
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingBottom: 'env(safe-area-inset-bottom)', // Suporte para notch de iPhone
  },
  navContent: {
    display: 'flex',
    width: '100%',
    maxWidth: '500px',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  navItem: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '8px 0',
    flex: 1,
    transition: 'transform 0.2s ease',
    outline: 'none',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: '-8px',
    width: '20px',
    height: '3px',
    backgroundColor: '#4fd1c5',
    borderRadius: '0 0 4px 4px',
    boxShadow: '0 2px 10px rgba(79, 209, 197, 0.5)',
  },
  inactiveIndicator: {
    height: '3px',
  },
  label: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
};

export default BottomNavigation;