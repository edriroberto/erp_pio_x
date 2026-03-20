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
          borderRadius: '8px',
          padding: '6px 10px',
          marginBottom: '7px', 
          cursor: 'pointer',
          borderLeft: `5px solid ${pendencia ? "#e53e3e" : (selecionado ? "#3498db" : "#2c3e50")}`,
          backgroundColor: pendencia ? "#fff5f5" : "#fff",
          boxShadow: selecionado ? '0 2px 8px rgba(52,152,219,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
          borderTop: '1px solid #eee',
          borderRight: '1px solid #eee',
          borderBottom: '1px solid #eee',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#08060d', flex: 1, lineHeight: '1.1' }}>
            {pendencia && <span style={{ marginRight: 3 }}>⚠️</span>}
            {dado.nome}
          </div>
          <span style={{ fontSize: '10px', color: '#ccc', marginLeft: '8px' }}>#{dado.id}</span>
        </div>

        <div style={{ 
          fontSize: '11px', color: '#444', 
          background: pendencia ? 'rgba(229, 62, 62, 0.04)' : '#f3f4f6', 
          padding: '1px 4px', borderRadius: '4px',
          marginBottom: '-3px', marginTop: '-5px',
          display: 'flex', justifyContent: 'space-between',
          gap: "10px",
          marginLeft: -5,
          
        }}>
          <span><strong>Local:</strong> {dado.quadra}</span>
          <span><strong>Lote:</strong> {dado.lote}</span>
          <span><strong>Gav.:</strong> {dado.gaveta || "—"}</span>
        </div>

        <div style={{ fontSize: '11px', display: 'flex', gap: '10px', color: '#555', marginBottom: '0px' }}>
          <span>Nasc: <strong>{exibirData(dado.nascimento)}</strong></span>
          <span>Falec: <strong>{exibirData(dado.falecimento)}</strong></span>
          <span style={{ marginLeft: 'auto', color: '#2b4c9b' }}><strong>{dado.idade} anos</strong></span>
        </div>

        <div style={{ fontSize: '10px', color: '#777', borderTop: '1px solid #f2f2f2', paddingTop: '2px', marginBottom:'3px' }}>
          <div style={{ lineHeight: '1.1' }}>
            
              <strong>Funerária {dado.funeraria || "—"}</strong> 
            
          </div>
          {dado.observacoes && (
            <div style={{ fontSize: '9px', color: '#999', fontStyle: 'italic', lineHeight: '1.1', marginTop: '4px' }}>
              {dado.observacoes}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP (TABELA ALINHADA) ---
  return (
    <tr 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        backgroundColor: selecionado ? "#ebf5ff" : (pendencia ? "#fff5f5" : "transparent"),
        fontSize: '13px',
        borderBottom: '1px solid #eee'
      }}
    >                                 
      <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1e293b', width: '25%' }}>
        {pendencia && <span style={{ marginRight: '5px' }}>⚠️</span>}
        {dado.nome}
      </td>
      <td style={{ padding: '8px' }}>{dado.quadra}</td>
      <td style={{ padding: '8px', textAlign: 'center' }}>{dado.lote}</td>
      <td style={{ padding: '8px', textAlign: 'center' }}>{dado.gaveta || "-"}</td>
      <td style={{ padding: '8px' }}>{exibirData(dado.nascimento)}</td>
      <td style={{ padding: '8px' }}>{exibirData(dado.falecimento)}</td>
      <td style={{ padding: '8px', textAlign: 'center' }}>{dado.idade}</td>
      <td style={{ padding: '8px' }}>{dado.funeraria}</td>
      <td style={{ 
        padding: '8px 12px',
        fontSize: '12px', 
        color: pendencia ? "#c53030" : "#666",
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {dado.observacoes}
      </td>
    </tr>
  );
};

export default SepultamentoCard;