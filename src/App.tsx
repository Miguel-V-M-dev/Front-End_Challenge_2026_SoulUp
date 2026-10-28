import { Route, Routes } from "react-router-dom";
import RotaProtegida from "./components/auth/RotaProtegida";
import Layout from "./components/layout/Layout";
import Cadastro from "./pages/Cadastro";
import Contato from "./pages/Contato";
import Faq from "./pages/Faq";
import Home from "./pages/Home";
import Integrantes from "./pages/Integrantes";
import Login from "./pages/Login";
import MissaoDetalhe from "./pages/MissaoDetalhe";
import Missoes from "./pages/Missoes";
import NotFound from "./pages/NotFound";
import Perfil from "./pages/Perfil";
import Sobre from "./pages/Sobre";
import Transporte from "./pages/Transporte";

export default function App() {
  return (
    <Routes>
      {/* Layout é a "casca" (Header + Footer) compartilhada por todas as rotas */}
      <Route element={<Layout />}>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/integrantes" element={<Integrantes />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/missoes" element={<Missoes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rota dinâmica: ":id" é lido via useParams em MissaoDetalhe */}
        <Route path="/missoes/:id" element={<MissaoDetalhe />} />

        {/* Rotas que exigem login: RotaProtegida redireciona para /login */}
        <Route element={<RotaProtegida />}>
          <Route path="/transporte" element={<Transporte />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Coringa: qualquer caminho não mapeado cai no 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
