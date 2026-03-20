import SepultamentoCard from "./SepultamentoCard"
import { AlertCircle } from "lucide-react"; // Novo ícone

export default function SepultamentoList({
  dados,
  selecionado,
  onSelecionar,
  formatarData
}) {

  if (!dados || dados.length === 0) {
    return (
      <div style={{
        padding: 20,
        textAlign: "center",
        color: "#777"
      }}>
        Nenhum registro encontrado
      </div>
    )
  }

  return (

    <div style={{
      paddingBottom: 30
    }}>

      {dados.map((s) => (

        <SepultamentoCard
          key={s.id}
          dado={{
            ...s,
            nascimento: formatarData(s.data_nascimento),
            falecimento: formatarData(s.data_falecimento)
          }}
          selecionado={selecionado?.id === s.id}
          onClick={() => onSelecionar(s)}
        />

      ))}

    </div>

  )
}