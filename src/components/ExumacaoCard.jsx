const ExumacaoCard = ({ dado, onConfirmar, formatarData }) => {
  const corBorda = {
    'VERMELHO': '#e53e3e', // Vermelho (Urgente)
    'AMARELO': '#ecc94b',  // Amarelo (Atenção)
    'VERDE': '#48bb78'     // Verde (No prazo)
  }[dado.alerta_cor] || '#cbd5e0';

  const jaPodeExumar = dado.alerta_cor === 'VERMELHO';

  return (
    <div style={{
      background: '#fff',
      borderLeft: `8px solid ${corBorda}`,
      padding: '12px',
      marginBottom: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: '14px' }}>{dado.nome}</strong>
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#718096' }}>{dado.tipo_lote}</span>
      </div>

      <div style={{ fontSize: '12px', color: '#4a5568', margin: '5px 0' }}>
        {dado.quadra} • Lote {dado.lote} {dado.gaveta ? `• GAVETA ${dado.gaveta}` : ''}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px' }}>
        <span>Sepultado: <strong>{formatarData(dado.data_sepultamento)}</strong></span>
        <span style={{ color: corBorda, fontWeight: 'bold' }}>
          {jaPodeExumar ? "PRONTO PARA EXUMAR" : dado.alerta_cor === 'AMARELO' ? "AVISO: 2.5 ANOS" : "DENTRO DO PRAZO"}
        </span>
      </div>

      {jaPodeExumar && (
        <button 
          onClick={() => onConfirmar(dado)}
          style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          CONFIRMAR EXUMAÇÃO
        </button>
      )}
    </div>
  );
};

export default ExumacaoCard;