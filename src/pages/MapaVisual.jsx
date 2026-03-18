import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function MapaVisual() {
  const [searchParams] = useSearchParams();
  const quadraParam = searchParams.get("quadra");

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const escala = 0.3;

  useEffect(() => {
    carregarQuadras();
  }, []);

  useEffect(() => {
    if (quadraParam) {
      setQuadraId(Number(quadraParam));
      carregarMapa(Number(quadraParam));
    }
  }, [quadraParam]);

  async function carregarQuadras() {
    const { data } = await supabase.from("quadras").select("*").order("nome");
    setQuadras(data || []);
  }

  async function carregarMapa(id) {
  const { data, error } = await supabase
    .from("mapa_lotes")
    .select(`
      *,
      lote:lotes (
        id,
        numero
      )
    `)
    .eq("quadra_id", Number(id));

  console.log("MAPA:", data, error);

  setLotes(data || []);
}

  function selecionarQuadra(id) {
    setQuadraId(id);
    carregarMapa(id);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Mapa da Quadra</h2>

      {/* SELECT */}
      <select
        value={quadraId || ""}
        onChange={(e) => selecionarQuadra(Number(e.target.value))}
      >
        <option value="">Selecione a quadra</option>
        {quadras.map((q) => (
          <option key={q.id} value={q.id}>
            {q.nome}
          </option>
        ))}
      </select>

      {/* MAPA */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1000,
          height: 600,
          border: "1px solid #ccc",
          marginTop: 20,
          overflow: "auto",
          background: "#fafafa",
        }}
      >
        {lotes.map((item) => {
          const ocupado = item.lote.sepultamentos?.length > 0;

          return (
            
            <div
  key={item.id}
  onClick={() => setLoteSelecionado(item.lote)}
  style={{
    position: "absolute",
    left: item.pos_x,
    top: item.pos_y,
    //width: item.largura ,
    //height: item.altura,
    width : 110  * escala,
    height : 220  * escala,
    border: "3px solid #ff6600",
    background: "#eee",
    borderTopLeftRadius: 10,
borderTopRightRadius: 10,
borderBottomLeftRadius: 0,
borderBottomRightRadius: 0,
    transform: `rotate(${item.rotacao || 0}deg)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  }}
>
  {/* CRUZ */}
  <div style={{ fontSize: 14, color: "orange" }}>✝</div>

  {/* TIPO */}
  <div style={{ fontWeight: "bold" }}>
    {item.tipo || "C"}
  </div>

  {/* NUMERO */}
  <div style={{ fontSize: 14 }}>
    {item.lote?.numero}
  </div>
</div>
          );
        })}
      </div>

      {/* MODAL */}
      {loteSelecionado && (
        <div
          onClick={() => setLoteSelecionado(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
            }}
          >
            <h3>Lote {loteSelecionado.numero}</h3>

            {loteSelecionado.sepultamentos?.length > 0 ? (
              loteSelecionado.sepultamentos.map((s) => (
                <div key={s.id}>
                  <p><strong>Nome:</strong> {s.nome_falecido}</p>
                  <p><strong>Data:</strong> {s.data_sepultamento}</p>
                </div>
              ))
            ) : (
              <p>Lote vazio</p>
            )}

            <button onClick={() => setLoteSelecionado(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}