import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import Dashboard from "./pages/Dashboard"
import Sepultamentos from "./pages/Sepultamentos"
import SepultamentosMes from "./pages/SepultamentosMes"
import SepultamentosNome from "./pages/SepultamentosNome"
import SepultamentosPeriodo from "./pages/SepultamentosPeriodo"
import Coveiros from "./pages/Coveiros"
import Quadras from "./pages/Quadras"
import Lotes from "./pages/Lotes"
import Funerarias from "./pages/Funerarias"
import CadastroSepultamento from "./pages/CadastroSepultamento"


function App() {

  return (

    <BrowserRouter>
<div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/*<div style={{display:"flex"}}> */}

        <Sidebar />

<div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          minWidth: 0   // 🔥 ESSENCIAL para scroll horizontal funcionar
        }}>


          <Header />

<main style={{ 
  flex: 1, 
  padding: 20, 
  overflow: "hidden", // 🔥 Mude para hidden para matar a barra externa
  display: "flex", 
  flexDirection: "column",
  backgroundColor: "#f4f7f6" // Cor de fundo opcional para contraste
}}>            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route path="/sepultamentos" element={<Sepultamentos />} />
             
              <Route path="/sepultamentos-nome" element={<SepultamentosNome />} />
              
              <Route path="/sepultamentos-periodo" element={<SepultamentosPeriodo />} />                            

              <Route path="/coveiros" element={<Coveiros />} />

              <Route path="/funerarias" element={<Funerarias />} />

              <Route path="/quadras" element={<Quadras />} />

              <Route path="/lotes" element={<Lotes />} />

              <Route path="/cadastrar-sepultamento" element={<CadastroSepultamento />} />

              <Route path="/cadastroSepultamento/:id" element={<CadastroSepultamento />}
/>

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>

  )
}

export default App