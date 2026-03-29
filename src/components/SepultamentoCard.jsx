import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  MapPin,    
  Star,      
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

  const calcularIdade = () => {
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
      if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--;
      return idade >= 0 ? idade : (dado.idade || "—");
    } catch (e) { return dado.idade || "—"; }
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
          background: selecionado ? '#f0fdf4' : 'var(--jardim-pedra)', // Mármore por padrão
          borderRadius: '0px', // Lista contínua como no exumação
          padding: '5px 10px',
          marginBottom: '2px', 
          cursor: 'pointer',
          // Borda lateral: Vermelho se pendente, Verde Musgo se selecionado, Cinza se neutro
          borderLeft: `4px solid ${pendencia ? "#e53e3e" : (selecionado ? "var(--jardim-primaria)" : "#cbd5e0")}`,
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Nome e ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '800', 
            color: pendencia ? "#c53030" : "var(--jardim-primaria)", 
            flex: 1, 
            lineHeight: '1.0' 
          }}>
            {pendencia && <AlertCircle size={12} color="#e53e3e" style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {dado.nome?.toUpperCase()}
          </div>
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8' }}>#{dado.id}</span>
        </div>

        {/* Localização em linha única cinza suave */}
        <div style={{ 
          fontSize: '11px', 
          color: '#475569', 
          background: 'rgba(0,0,0,0.03)', 
          padding: '2px 8px', 
          borderRadius: '4px',
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          margin: '2px 0 1px 0'
        }}>
          <MapPin size={12} color="#64748b" />
          <span style={{ fontWeight: '600' }}>
            {dado.quadra} • {dado.lote} • Pos. {dado.gaveta || "-"}
          </span>
        </div>
       
        {/* Datas e Idade */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', marginBottom: '2px', gap: '2px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={11} color="#94a3b8" />
              <span style={{ fontSize: '10px', color: '#334155', fontWeight: '700' }}>
                {exibirData(dado.nascimento || dado.data_nascimento)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Cross size={11} color="#94a3b8" />
              <span style={{ fontSize: '10px', color: '#334155', fontWeight: '700' }}>
                {exibirData(dado.falecimento || dado.data_falecimento)}
              </span>
            </div>
          </div>
          
          <span style={{ 
            fontSize: '10px', 
            background: 'var(--jardim-acento)', 
            color: '#fff', 
            padding: '1px 8px', 
            borderRadius: '10px',
            fontWeight: '800'
          }}>
            {idadeFinal} ANOS
          </span>
        </div>                   

        {/* Funerária e Obs */}
        <div style={{ 
          fontSize: '10px', 
          color: '#64748b', 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '4px', 
          marginTop: '1px' 
        }}>
          <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '9px' }}>
            Funerária <span style={{ color: '#334155' }}>{dado.funeraria || "—"}</span>
          </div>
          {dado.observacoes && (
            <div style={{ 
              fontSize: '10px', 
              color: '#94a3b8', 
              fontStyle: 'italic', 
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {dado.observacoes}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP ---
  return (
    <tr 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        backgroundColor: selecionado ? "#f0fdf4" : (pendencia ? "#fff5f5" : "transparent"),
        fontSize: '13px',
        borderBottom: '1px solid #e2e8f0',
        transition: 'background 0.2s'
      }}
    >                                    
      <td style={{ padding: '10px 8px', fontWeight: "700", color: pendencia ? "#c53030" : "var(--jardim-primaria)" }}>
        {pendencia && <AlertCircle size={14} color="#e53e3e" style={{ marginRight: 8, verticalAlign: 'middle' }} />}
        {dado.nome?.toUpperCase()}
      </td>
      <td style={{ padding: '10px 8px', color: '#475569' }}>{dado.quadra}</td>
      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>{dado.lote}</td>
      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>{dado.gaveta || "-"}</td>
      <td style={{ padding: '10px 8px', fontWeight: '600' }}>{exibirData(dado.nascimento || dado.data_nascimento)}</td>
      <td style={{ padding: '10px 8px', fontWeight: '600' }}>{exibirData(dado.falecimento || dado.data_falecimento)}</td>
      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
          {idadeFinal}
        </span>
      </td>
      <td style={{ padding: '10px 8px', fontSize: '12px' }}>{dado.funeraria}</td>
      <td style={{ 
        padding: '10px 8px',
        fontSize: '11px', 
        color: '#94a3b8',
        fontStyle: 'italic',
        maxWidth: '150px',
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