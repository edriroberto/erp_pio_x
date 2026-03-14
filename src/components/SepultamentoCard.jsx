const SepultamentoCard = ({ dado }) => {
  const estiloCard = {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '5px solid #2f3542', // Uma bordinha charmosa na lateral
    fontFamily: 'sans-serif'
  };

  const estiloTitulo = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
    textTransform: 'uppercase'
  };

  const estiloLinha = {
    fontSize: '14px',
    margin: '4px 0',
    color: '#555'
  };

  return (
    <div style={estiloCard}>
      <div style={estiloTitulo}>{dado.nome}</div>
      <div style={estiloLinha}><strong>Nasc:</strong> {dado.nascimento} - <strong>Falec:</strong> {dado.falecimento}</div>
      <div style={estiloLinha}><strong>Local:</strong> {dado.quadra} - <strong>Lote:</strong> {dado.lote}</div>
      <div style={estiloLinha}><strong>Funerária:</strong> <em>{dado.funeraria}</em></div>
      <div style={{...estiloLinha, fontSize: '12px', color: '#888', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px'}}>
        Registro enviado em: {dado.data_envio || '12/03/2026'}
      </div>
    </div>
  );
};