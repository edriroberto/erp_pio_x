import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  MapPin,    // Para Local/Quadra
  Star,      // Para Nascimento
  Cross,
} from "lucide-react";

const SepultamentoCard = ({ dado, selecionado, onClick, formatarData }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!dado) return null;

  // --- LÓGICA DE CÁLCULO (O "HOOK" DE IDADE) ---
  const calcularIdade = () => {
    // Tenta pegar das datas cruas ou das já formatadas que vem do List
    const dn = dado.data_nascimento || dado.nascimento;
    const df = dado.data_falecimento || dado.falecimento;

    if (!dn || !df) return dado.idade || "—";
    
    try {
      const parseData = (d) => {
        if (!d) return null;
        if (typeof d !== 'string') return new Date(d);
        if (d.includes('/')) {
          const [dia, mes, ano] = d.split('/');
          return new Date(ano, mes - 1, dia);
        }
        return new Date(d);
      };

      const nasc = parseData(dn);
      const falec = parseData(df);

      if (!nasc || !falec || isNaN(nasc) || isNaN(falec)) return dado.idade || "—";
      
      let idade = falec.getFullYear() - nasc.getFullYear();
      const m = falec.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) {
        idade--;
      }
      return idade >= 0 ? idade : (dado.idade || "—");
    } catch (e) {
      return dado.idade || "—";
    }
  };

  const idadeFinal = calcularIdade();
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
          margin: '2px 5px 2px 5px', 
          cursor: 'pointer',
          borderLeft: `3px solid ${pendencia ? "#e53e3e" : (selecionado ? "#3498db" : "#2c3e50")}`,
          backgroundColor: pendencia ? "#fff5f5" : "#fff",
          boxShadow: selecionado ? '0 2px 8px rgba(52,152,219,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
          borderTop: '1px solid #eee',
          borderRight: '1px solid #eee',
          borderBottom: '1px solid #eee',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#08060d', flex: 1, lineHeight: '1.1' }}>
            {pendencia && (
              <span style={{ marginRight: 3 }}>
                <AlertCircle size={11} color="#e53e3e" strokeWidth={2} />
              </span>
            )}
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
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '4px' }} title="Quadra/Local">
            <MapPin size={14} color="#718096" />
            <span>
              {dado.quadra} 
              <span style={{ fontSize: '11px', margin: '0 8px' }}>•</span>
              {dado.lote} 
              <span style={{ fontSize: '11px', margin: '0 8px' }}>•</span>
              Pos. {dado.gaveta || "-"}
            </span>
          </div>
        </div>
       
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <Star size={12} color="#718096" />
          <span style={{ fontSize: '11px', color: '#4a5568' }}>
            <strong>{exibirData(dado.nascimento || dado.data_nascimento)}</strong>
          </span>
          <span style={{ fontSize: '11px', margin: '0 8px' }}>•</span>
          <Cross size={12} color="#718096" />
          <span style={{ fontSize: '11px', color: '#4a5568' }}>
            <strong>{exibirData(dado.falecimento || dado.data_falecimento)}</strong>
          </span>
          <span style={{ fontSize: '11px', marginLeft: 'auto', color: '#2b4c9b' }}>
            <strong>{idadeFinal} anos</strong>
          </span>
        </div>                   

        <div style={{ fontSize: '11px', color: '#777', borderTop: '1px solid #f2f2f2', paddingTop: '2px', marginBottom:'3px', marginTop: '4px' }}>
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
      <td style={{ padding: '8px', display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
        {pendencia && (
          <AlertCircle 
            size={16} 
            color="#e53e3e" 
            strokeWidth={2.5}
            title="Óbito pendente" 
          />
        )}
        {dado.nome}
      </td>
      <td style={{ padding: '8px' }}>{dado.quadra}</td>
      <td style={{ padding: '8px', textAlign: 'center' }}>{dado.lote}</td>
      <td style={{ padding: '8px', textAlign: 'center' }}>{dado.gaveta || "-"}</td>
      <td style={{ padding: '8px' }}>{exibirData(dado.nascimento || dado.data_nascimento)}</td>
      <td style={{ padding: '8px' }}>{exibirData(dado.falecimento || dado.data_falecimento)}</td>
      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
        {idadeFinal}
      </td>
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