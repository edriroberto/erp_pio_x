export default function Toolbar() {

  return (

    <div style={{
      display:"flex",
      gap:"10px",
      marginBottom:"30px",
      marginTop:"50px"
    }}>

      <button>Filtrar</button>
      <button>Inserir</button>
      <button>Editar</button>
      <button style={{background:"#e74c3c",color:"white"}}>
        Excluir
      </button>

    </div>

  )

}