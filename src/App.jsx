import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import { useAuth } from "./Hooks/useAuth"; // Hook que criamos para gerenciar permissões

// Componentes de Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Páginas
import LoginPage from "./pages/LoginPage";
import RecuperarSenha from "./pages/RecuperarSenha";
import Dashboard from "./pages/Dashboard";
import Sepultamentos from "./pages/Sepultamentos";
import SepultamentosNome from "./pages/SepultamentosNome";
import SepultamentosPeriodo from "./pages/SepultamentosPeriodo";
import SepultamentosLote from "./pages/SepultamentosLote";
import Coveiros from "./pages/Coveiros";
import Quadras from "./pages/Quadras";
import Lotes from "./pages/Lotes";
import Funerarias from "./pages/Funerarias";
import CadastroSepultamento from "./pages/CadastroSepultamento";
import Exumacoes from "./pages/PainelExumacao";
import RelatorioExumacoes from "./pages/RelatorioExumacoes";

/**
 * COMPONENTE DE PROTEÇÃO DE ROTA
 * Verifica se o usuário tem o nível necessário para acessar a página.
 */
function ProtectedRoute({ children, niveisPermitidos }) {
  const { perfil, loading } = useAuth();

  // Enquanto verifica o nível no banco de dados
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Validando permissões...</p>
      </div>
    );
  }

  // Se não houver perfil ou o nível não estiver na lista permitida, redireciona para o início
  if (!perfil || !niveisPermitidos.includes(perfil.nivel)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca sessão inicial
    supabase.auth.getSession().then(res => {
      setSession(res.data.session);
      setLoading(false);
    });

    // Escuta mudanças na autenticação (Login/Logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Carregando sistema...</div>;

  return (
    <BrowserRouter>
      {session ? (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", boxSizing: "border-box" }}>
          {/* Sidebar agora recebe a sessão para controle interno de menus */}
          <Sidebar session={session} setSession={setSession} /> 
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Header session={session} setSession={setSession} />
            
            <main style={{ 
              flex: 1, 
              padding: 20, 
              overflow: "hidden", 
              display: "flex", 
              flexDirection: "column", 
              backgroundColor: "#f4f7f6" 
            }}>
              <Routes>
                {/* --- ROTAS LIVRES (Todos os níveis acessam) --- */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sepultamentos-nome" element={<SepultamentosNome />} />
                <Route path="/sepultamentos-periodo" element={<SepultamentosPeriodo />} />
                <Route path="/sepultamentos-lote" element={<SepultamentosLote />} />

                {/* --- ROTAS DE GESTÃO (Apenas Admin e Master) --- */}
                <Route path="/sepultamentos" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><Sepultamentos /></ProtectedRoute>
                } />
                <Route path="/quadras" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><Quadras /></ProtectedRoute>
                } />
                <Route path="/lotes" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><Lotes /></ProtectedRoute>
                } />
                <Route path="/funerarias" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><Funerarias /></ProtectedRoute>
                } />
                <Route path="/coveiros" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><Coveiros /></ProtectedRoute>
                } />
                <Route path="/cadastrar-sepultamento" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><CadastroSepultamento /></ProtectedRoute>
                } />
                <Route path="/cadastroSepultamento/:id" element={
                  <ProtectedRoute niveisPermitidos={['admin', 'master']}><CadastroSepultamento /></ProtectedRoute>
                } />

                {/* --- ROTAS ESTRATÉGICAS (Exclusivas do Master) --- */}
                <Route path="/exumacoes" element={
                  <ProtectedRoute niveisPermitidos={['master']}><Exumacoes /></ProtectedRoute>
                } />
                <Route path="/relatorioexumacoes" element={
                  <ProtectedRoute niveisPermitidos={['master']}><RelatorioExumacoes /></ProtectedRoute>
                } />

                {/* Redirecionamento padrão para logados */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        /* --- ROTAS DESLOGADAS --- */
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}