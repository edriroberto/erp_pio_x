import React, { useState, useEffect } from "react";

const SepultamentoCard = ({ dado, selecionado, onClick, formatarData }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!dado) return null;

  const pendencia = dado.obito_entregue === false;
  
  const exibirData = (valor) => {
    if (!valor) return "—";
    return formatarData ? formatarData(valor) : valor;
  };

  if (isMobile) {
    return (
      <div 
        onClick={onClick}
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '12px', // Reduzido de 16px para 12px
          marginBottom: '12px',
          cursor: 'pointer',
          borderLeft: `5px solid ${pendencia ? "#e53e3e" : (selecionado ? "#3498db" : "#2c3e50")}`,
          backgroundColor: pendencia ? "#fff5f5" : "#fff",
          boxShadow: selecionado 
            ? '0 4px 12px rgba(52,152,219,0.2)' 
            : '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          borderTop: '1px solid #eee',
          borderRight: '1px solid #eee',
          borderBottom: '1px solid #eee',
        }}
      >
        {/* 1. CABEÇALHO (NOME E ID) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#08060d', flex: 1, lineHeight: '1.2' }}>
            {pendencia && <span style={{ marginRight: 4 }}>⚠️</span>}
            {dado.nome}
          </div>
          <span style={{ fontSize: '9px', color: '#aaa', marginLeft: '8px' }}>ID: {dado.id}</span>
        </div>

        {/* 2. LOCALIZAÇÃO (DESIGN MAIS COMPACTO) */}
        <div style={{ 
          fontSize: '11px', // Reduzido de 13px
          color: '#444', 
          background: pendencia ? 'rgba(229, 62, 62, 0.04)' : '#f3f4f6', 
          padding: '6px 10px', 
          borderRadius: '5px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span><strong>QUADRA:</strong> {dado.quadra}</span>
          <span><strong>LOTE:</strong> {dado.lote}</span>
          <span><strong>GAVETA:</strong> {dado.gaveta || "—"}</span>
        </div>

        {/* 3. DATAS E IDADE */}
        <div style={{ 
          fontSize: '11px', // Reduzido de 13px
          display: 'flex', 
          gap: '12px',
          color: '#555',
          marginBottom: '8px'
        }}>
          <span>Nasc: <strong>{exibirData(dado.nascimento)}</strong></span>
          <span>Falec: <strong>{exibirData(dado.falecimento)}</strong></span>
          <span style={{ marginLeft: 'auto', color: '#2b4c9b' }}><strong>{dado.idade} anos</strong></span>
        </div>

        {/* 4. FUNERÁRIA E OBS */}
        <div style={{ 
          fontSize: '11px', 
          color: '#777', 
          borderTop: '1px solid #f0f0f0', 
          paddingTop: '6px'
        }}>
          <div style={{ marginBottom: dado.observacoes ? '4px' : '0' }}>
            <strong>FUNERÁRIA:</strong> <span style={{ color: '#444' }}>{dado.funeraria || "—"}</span>
          </div>
          {dado.observacoes && (
            <div style={{ 
              fontSize: '10px', 
              color: '#888', 
              fontStyle: 'italic',
              lineHeight: '1.3'
            }}>
              {dado.observacoes}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP MANTÉM IGUAL ---
  return (
    <tr 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        backgroundColor: selecionado ? "#ebf5ff" : (pendencia ? "#fff5f5" : "transparent"),
        fontSize: '13px' // Fonte da tabela levemente menor também
      }}
    >
      <td style={{ fontWeight: '600' }}>{pendencia && "⚠️ "}{dado.nome}</td>
      <td style={{ textAlign: 'center' }}>{dado.quadra}</td>
      <td style={{ textAlign: 'center' }}>{dado.lote}</td>
      <td style={{ textAlign: 'center' }}>{dado.gaveta || "-"}</td>
      <td>{exibirData(dado.nascimento)}</td>
      <td>{exibirData(dado.falecimento)}</td>
      <td style={{ textAlign: 'center' }}>{dado.idade}</td>
      <td>{dado.funeraria}</td>
      <td style={{ fontSize: '11px', color: '#888' }}>{dado.observacoes}</td>
    </tr>
  );
};

export default SepultamentoCard;