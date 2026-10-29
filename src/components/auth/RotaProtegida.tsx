import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Carregando } from "../ui/Estado";

/**
 * Agrupa rotas que exigem login. Espera a restauração da sessão (GET /api/auth/me)
 * antes de decidir; sem usuário, redireciona para /login guardando a página pedida.
 */
export default function RotaProtegida() {
    const { usuario, carregando } = useAuth();
    const location = useLocation();

    if (carregando) return <Carregando texto="Verificando sua sessão..." />;

    if (!usuario) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return <Outlet />;
}
