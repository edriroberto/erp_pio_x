import React from "react";
import { AlertCircle, MapPin, Calendar } from "lucide-react";

const SepultamentoCard = ({ dado, selecionado, onClick, formatarData, isMobile }) => {
  if (!dado) return null;
  const pendencia = dado.obito_entregue === false;

  if (isMobile) {
    return (
      <div 
        onClick={onClick}
        style={{
          background: selecionado ? '#f1f5f9' : '#fff',
          padding: '16px',
          borderBottom: '1px solid #f1f5f9',
          borderLeft: `4px solid ${pendencia ? "#ef4444" : (selecionado ? "#3b82f6" : "transparent")}`,
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {pendencia && <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} />}
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{dado.nome}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>#{dado.id}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            <span>{dado.quadra} • Lote {dado.lote} {dado.gaveta && `• Gav. ${dado.gaveta}`}</span>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr auto', 
          background: '#f8fafc', 
          padding: '8px 12px', 
          borderRadius: '8px',
          fontSize: '12px' 
        }}>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>FALECIMENTO</span>
            <span style={{ fontWeight: '600' }}>{formatarData(dado.data_falecimento)}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>IDADE</span>
            <span style={{ fontWeight: '600' }}>{dado.idade} anos</span>
          </div>
          <div style={{ textAlign: 'right', alignSelf: 'center' }}>
             <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
               {dado.funeraria || "—"}
             </span>
          </div>
        </div>
      </div>
    );
  }

  // Versão Desktop permanece como <tr> (renderizada dentro da <table> na Page)
  return (
    <tr onClick={onClick} className={selecionado ? "selecionada" : ""}>
      {/* ... conteúdo da sua TR original ... */}
    </tr>
  );
};