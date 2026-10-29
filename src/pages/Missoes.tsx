import { Link } from "react-router-dom";
import type { MissaoComStatus } from "../types";
import MissionCard from "../components/ui/MissionCard";
import PageHero from "../components/ui/PageHero";
import { useAuth } from "../context/useAuth";
import { useApi } from "../hooks/useApi";
import { listarMissoes, listarMissoesConcluidas } from "../services/ecoloopService";
import { Carregando, ErroCarregar } from "../components/ui/Estado";

export default function Missoes() {
    const { usuario, carregando: carregandoSessao } = useAuth();

    // Missões (público) + conclusões do usuário logado. Espera a sessão ser restaurada.
    const { dados, erro, carregando, recarregar } = useApi(
        async () => {
            const [missions, concluidas] = await Promise.all([
                listarMissoes(),
                usuario ? listarMissoesConcluidas() : Promise.resolve([]),
            ]);
            return { missions, concluidas };
        },
        `missoes:${usuario?.idUsuario ?? "anon"}`,
        !carregandoSessao,
    );

    // Só vale a conclusão do período em andamento (periodoAtual): missão diária concluída
    // ontem volta a ficar disponível hoje.
    const idsConcluidos = dados?.concluidas.filter((um) => um.periodoAtual).map((um) => um.idMissao) ?? [];
    const missions: MissaoComStatus[] = (dados?.missions ?? []).map((m) => ({
        ...m,
        concluida: idsConcluidos.includes(m.idMissao),
    }));
    const ativas = missions.filter((missao) => missao.ativa);
    const ativasConcluidas = ativas.filter((missao) => missao.concluida);
    const pontosGanhos = dados?.concluidas.reduce((total, um) => total + um.pontosGanhos, 0) ?? 0;

    return (
        <div>
            <PageHero titulo="Missões sustentáveis">
                <p>Complete ações do dia a dia ligadas à sustentabilidade e conquiste pontos extras.</p>
                {usuario ? (
                    dados && <p className="text-sm text-brand-200">
                        {ativasConcluidas.length} de {ativas.length} missões ativas concluídas no período · +{pontosGanhos} pontos ganhos no total
                    </p>
                ) : (
                    <p className="text-sm text-brand-200">
                        <Link to="/login" state={{ from: "/missoes" }} className="underline">
                            Entre na sua conta
                        </Link>{" "}
                        para concluir missões e acumular pontos.
                    </p>
                )}
            </PageHero>

            {carregando || carregandoSessao ? (
                <Carregando texto="Carregando missões..." />
            ) : erro ? (
                <section className="px-4 py-14">
                    <ErroCarregar mensagem={erro} onTentarNovamente={recarregar} />
                </section>
            ) : missions.length === 0 ? (
                <p className="px-4 py-14 text-center text-sm text-gray-600">Nenhuma missão disponível no momento.</p>
            ) : (
                <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                    {missions.map((missao) => (
                        <MissionCard
                            key={missao.idMissao}
                            missao={missao}
                            concluida={missao.concluida}
                        />
                    ))}
                </section>
            )}
        </div>
    );
}
