import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { AlertCircle } from "lucide-react"; // Novo ícone

import Toolbar from "../components/Toolbar";
import SepultamentoList from "../components/SepultamentoList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

import "../styles/tabela.css";

export default function Sepultamentos() {
  const [dados, setDados] = useState([]);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Resize listener centralizado
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ... (suas funções carregar, excluir, buscar permanecem as mesmas) ...

  return (
    <ContainerPagina titulo="Sepultamentos">
      
      {/* Área de Busca e Ações */}
      <div style={{ 
        padding: isMobile ? "0 16px" : "0", 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px" 
      }}>
        <SepultamentoSearchBar onBuscar={buscar} />
        
        <Toolbar
          onInserir={handleInserir}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          itemSelecionado={selecionado}
          mostrarFiltro={false}
          fixa={isMobile} // Sticky no mobile para acesso rápido
        />
      </div>

      <ContainerTabela>
        {isMobile ? (
          <div style={{ marginTop: "4px" }}>
            {dadosFiltrados.map(s => (
              <SepultamentoCard 
                key={s.id}
                dado={s}
                isMobile={true}
                selecionado={selecionado?.id === s.id}
                onClick={() => setSelecionado(s)}
                formatarData={formatarData}
              />
            ))}
          </div>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Localização</th>
                  <th>Datas</th>
                  <th>Idade</th>
                  <th>Funerária</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((s) => (
                   <tr 
                    key={s.id} 
                    onClick={() => setSelecionado(s)}
                    style={{ backgroundColor: selecionado?.id === s.id ? "#f1f5f9" : "transparent" }}
                   >
                     {/* Células da tabela normal */}
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContainerTabela>
    </ContainerPagina>
  );
}