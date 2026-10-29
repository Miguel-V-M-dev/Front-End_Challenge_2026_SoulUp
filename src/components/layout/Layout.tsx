import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const titulosPorRota: Record<string, string> = {
    "/": "SoulUp — Transporte Sustentável",
    "/sobre": "Sobre — SoulUp",
    "/integrantes": "Integrantes — SoulUp",
    "/missoes": "Missões — SoulUp",
    "/faq": "FAQ — SoulUp",
    "/contato": "Contato — SoulUp",
    "/transporte": "Converter pontos — SoulUp",
    "/login": "Entrar — SoulUp",
    "/cadastro": "Criar conta — SoulUp",
    "/perfil": "Meu perfil — SoulUp",
};

/** Layout raiz: cabeçalho + conteúdo da rota atual + rodapé. */
export default function Layout() {
    const location = useLocation();

    // useEffect nº1: roda sempre que a rota muda (dependência = pathname).
    // Atualiza o <title> da aba e leva a página para o topo, útil numa SPA
    // onde o navegador não recarrega a página inteira a cada navegação.
    useEffect(() => {
        const base = titulosPorRota[location.pathname] ?? "SoulUp — Ecoloop";
        document.title = location.pathname.startsWith("/missoes/")
            ? "Detalhe da missão — SoulUp"
            : base;
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}