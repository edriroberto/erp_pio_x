import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../Hooks/useMobile";

// Componentes do seu ERP
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import SepultamentoCard from "../components/SepultamentoCard";

// Utilitários
import { formatarData } from "../utils/formatarData"; 

import "../styles/tabela.css";

export default function SepultamentosLote() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [quadras, setQuadras] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [historico, setHistorico] = useState([]);
  
  const [quadraSel, setQuadraSel] = useState(null);
  const [loteSel, setLoteSel] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Carrega as quadras (exatamente como na sua tela de gestão)
  useEffect(() => {
    async function carregarQuadras() {
      const { data } = await supabase
        .from("quadras")
        .select("*")
        .order("nome");
      if (data) setQuadras(data);
    }
    carregarQuadras();
  }, []);

  // 2. Carrega lotes vinculados à quadra selecionada
  useEffect(() => {
    if (quadraSel) {
      async function carregarLotes() {
        const { data } = await supabase
          .from("lotes")
          .select("id, numero")
          .eq("quadra_id", quadraSel.id)
          .order("numero");
        if (data) setLotes(data);
      }
      carregarLotes();
      setLoteSel(""); 
      setHistorico([]);
    }
  }, [quadraSel]);

  // 3. Busca o histórico de quem passou por aquele lote
  async function buscarHistorico(loteId) {
    if (!loteId) return;
    setLoading(true);
    const { data } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .eq("lote_id", loteId)
      .order("data_falecimento", { ascending: false });

    if (data) setHistorico(data);
    setLoading(false);
  }

  
  return (
    <ContainerPagina titulo="Consulta por Lote">
      
      {/* SELETOR DE QUADRAS (BOTOES) */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        padding: '10px 0',
        marginBottom: '15px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {quadras.map(q => (
          <button
            key={q.id}
            onClick={() => setQuadraSel(q)}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: quadraSel?.id === q.id ? 'none' : '1px solid #e2e8f0',
              background: quadraSel?.id === q.id ? 'var(--jardim-primaria)' : '#fff',
              color: quadraSel?.id === q.id ? '#fff' : 'var(--jardim-texto)',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: quadraSel?.id === q.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {q.nome}
          </button>
        ))}
      </div>

      {/* SELETOR DE LOTE (COMBO) */}
      {quadraSel && (
        <div style={{ marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#718096', textTransform: 'uppercase', marginBottom: '5px' }}>
            Lotes da {quadraSel.nome}
          </label>
          <select 
            value={loteSel} 
            onChange={(e) => {
              setLoteSel(e.target.value);
              buscarHistorico(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e0',
              fontSize: '16px', // Evita zoom automático no iOS
              background: '#fff'
            }}
          >
            <option value="">Selecione um lote...</option>
            {lotes.map(l => (
              <option key={l.id} value={l.id}>{l.numero}</option>
            ))}
          </select>
        </div>
      )}

      {/* LISTAGEM DE RESULTADOS */}
      <div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0, // CRITICO: Permite que a div encolha e crie o scroll interno
  height: "100%",
}}>
        {loteSel && (
          <div style={{ fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>
            Histórico de Ocupação
          </div>
        )}

        <ContainerTabela>

            
          {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Carregando histórico...</div>}
          
          {!loading && historico.length > 0 ? (
            isMobile ? (
              historico.map(s => (

                <SepultamentoCard 
                  
                
                    key={s.id} 
                  dado={{
                    ...s,
                    nascimento: formatarData(s.data_nascimento),
                    falecimento: formatarData(s.data_falecimento)
                  }}
                  onClick={() => navigate(`/cadastroSepultamento/${s.id}`)}
                />
              ))
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Vaga</th>
                    <th>Nascimento</th>
                    <th>Falecimento</th>
                    <th>Sepultamento</th>
                    <th>Idade</th>
                    <th>Funerária</th>
                    <th>Observações</th>                    
                  </tr>
                </thead>
                <tbody>
                 
                    {historico.map(s => {
                    // Cálculo automático caso 's.idade' não exista na View
                    const calcularIdade = (dataNasc) => {
                    if (!dataNasc) return "-";
                    const nasc = new Date(dataNasc);
                    const hoje = new Date();
                    let idade = hoje.getFullYear() - nasc.getFullYear();
                    const m = hoje.getMonth() - nasc.getMonth();
                    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                        idade--;
                    }
                    return idade;
                    };

                    return (
                    <tr 
                        key={s.id} 
                        onDoubleClick={() => navigate(`/cadastroSepultamento/${s.id}`)} 
                        style={{ cursor: 'pointer' }}
                    >
                        <td style={{ fontWeight: '600' }}>{s.nome}</td>
                        <td style={{ textAlign: 'center' }}>{s.gaveta || "-"}</td>
                        <td>{formatarData(s.data_nascimento)}</td>
                        <td>{formatarData(s.data_falecimento)}</td>
                        <td>{formatarData(s.data_sepultamento)}</td>
                        {/* Tenta usar s.idade, se não existir, calcula na hora */}
                        <td>{s.idade ?? calcularIdade(s.data_nascimento)}</td>
                        <td>{s.funeraria}</td>
                        <td style={{ fontSize: "11px", opacity: 0.8 }}>{s.observacoes}</td>
                    </tr>
                    );
                })}

                </tbody>
              </table>
            )
          ) : (
            !loading && loteSel && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                Nenhum registro de sepultamento neste lote.
              </div>
            )
          )}
        </ContainerTabela>
      </div>
    </ContainerPagina>
  );
}