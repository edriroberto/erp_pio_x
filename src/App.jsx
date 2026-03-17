import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import LoginPage from "./pages/LoginPage";
import RecuperarSenha from "./pages/RecuperarSenha";
import Dashboard from "./pages/Dashboard";
import Sepultamentos from "./pages/Sepultamentos";
import SepultamentosNome from "./pages/SepultamentosNome";
import SepultamentosPeriodo from "./pages/SepultamentosPeriodo";
import Coveiros from "./pages/Coveiros";
import Quadras from "./pages/Quadras";
import Lotes from "./pages/Lotes";
import Funerarias from "./pages/Funerarias";
import CadastroSepultamento from "./pages/CadastroSepultamento";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(res => {
      setSession(res.data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <BrowserRouter>
      {session ? (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", boxSizing: "border-box" }}>
          <Sidebar session={session} setSession={setSession} /> {/* passa session */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Header session={session} setSession={setSession} />
            <main style={{ flex: 1, padding: 20, overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#f4f7f6" }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/dashboard" element={<Dashboard />} />                
                <Route path="/sepultamentos" element={<Sepultamentos />} />                

                <Route path="/sepultamentos-nome" element={<SepultamentosNome />}/>
                <Route path="/sepultamentos-periodo" element={<SepultamentosPeriodo />}/>
                <Route path="/quadras" element={<Quadras />}/>
                <Route path="/funerarias" element={<Funerarias />}/>
                <Route path="/coveiros" element={<Coveiros />}/>
                <Route path="/lotes" element={<Lotes />}/>
                <Route path="/cadastrar-sepultamento" element={<CadastroSepultamento />}/>
                <Route path="/cadastroSepultamento/:id" element={<CadastroSepultamento />}/>

                <Route path="/lotes" element={<Lotes />}/>

                {/* ... demais rotas privadas */}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}