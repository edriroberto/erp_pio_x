import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { supabase } from "../utils/supabaseClient";

export default function MapaEditor() {
  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState(null);
  const [lotes, setLotes] = useState([]);

  useEffect(() => {
    carregarQuadras();
  }, []);

  async function carregarQuadras() {
    const { data } = await supabase.from("quadras").select("*").order("nome");
    setQuadras(data || []);
  }

  async function carregarMapa(id) {
    const { data } = await supabase
      .from("mapa_lotes")
      .select("*, lote:lotes(*)")
      .eq("quadra_id", id);

    setLotes(data || []);
  }

  async function salvarPosicao(id, x, y) {
    await supabase
      .from("mapa_lotes")
      .update({ pos_x: x, pos_y: y })
      .eq("id", id);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Editor de Mapa</h2>

      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          setQuadraId(id);
          carregarMapa(id);
        }}
      >
        <option value="">Selecione a quadra</option>
        {quadras.map((q) => (
          <option key={q.id} value={q.id}>
            {q.nome}
          </option>
        ))}
      </select>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1000,
          height: 600,
          border: "2px dashed #aaa",
          marginTop: 20,
          overflow: "auto",
          background: "#f9f9f9",
        }}
      >
        {lotes.map((item) => (
          <Draggable
            key={item.id}
            position={{ x: item.pos_x, y: item.pos_y }}
            onStop={(e, data) =>
              salvarPosicao(item.id, data.x, data.y)
            }
          >
            <div
              style={{
                position: "absolute",
                width: item.largura,
                height: item.altura,
                border: "2px solid green",
                background: "#ccffcc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "move",
                fontSize: 12,
                borderRadius: 4,
              }}
            >
              {item.lote.numero}
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}