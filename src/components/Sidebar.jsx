import { NavLink } from "react-router-dom"

export default function Sidebar(){

  const estilo = {

    container:{
      width:260,
      minWidth:260,
      flexShrink:0,
      background:"#2f3542",
      color:"#fff",
      height:"100vh",
      padding:20,
      boxSizing:"border-box"
    },

    titulo:{
      fontSize:18,
      marginBottom:30,
      fontWeight:"bold"
    },

    menu:{
      display:"flex",
      flexDirection:"column",
      gap:8
    },

    item:{
      display:"block",
      padding:"8px 10px",
      color:"#fff",
      textDecoration:"none",
      borderRadius:4
    },
    ativo:{ 
      background:"#57606f"
    }
  }

  return(

    <div style={estilo.container}>

      <div style={estilo.titulo}>
        ERP Cemitério
      </div>

      <div style={estilo.menu}>




<NavLink to="/" style={({isActive}) => ({...estilo.item, ...(isActive ? estilo.ativo : {}) 
})}
>
  Início
</NavLink>

<NavLink to="/sepultamentos" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Sepultamentos
</NavLink>

<NavLink to="/sepultamentos-nome" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Sepultamentos por nome
</NavLink>

<NavLink to="/sepultamentos-periodo" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Sepultamentos por período
</NavLink>


<NavLink to="/quadras" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Quadras e Lotes
</NavLink>

<NavLink to="/funerarias" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Funerárias
</NavLink>

<NavLink to="/coveiros" style={({isActive}) => ({
    ...estilo.item, ...(isActive ? estilo.ativo : {})
  })}
>
  Coveiros
</NavLink>


      </div>

    </div>

  )

}