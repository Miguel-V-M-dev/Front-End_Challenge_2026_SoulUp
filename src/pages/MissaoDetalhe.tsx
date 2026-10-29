import { useState } from "react";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHero from "../components/ui/PageHero";
import { useAuth } from "../context/useAuth";
import { Carregando, ErroCarregar } from "../components/ui/Estado";
import { rotuloCategoria, rotuloConcluidaNoPeriodo, rotuloPeriodo } from "../data/categorias";
import { useApi } from "../hooks/useApi";
import { buscarMissao, concluirMissao, listarMissoesConcluidas } from "../services/ecoloopService";
import { formatarDataHora } from "../utils/conversao";

export default function MissaoDetalhe() {
    // useParams lê o parâmetro dinâmico definido na rota "/missoes/:id".
    const { id } = useParams<{ id: string }>();
    // useNavigate permite navegação programática (sem depender de um <Link>).
    const navigate = useNavigate();
    const { usuario, carregando: carregandoSessao, atualizarSaldo } = useAuth();

    // O id da URL é texto; a chave da missão (id_missao) é numérica.
    const idMissao = Number(id);
    const { dados, erro: erroCarga, status, carregando, recarregar } = useApi(
        async () => {
            const [missao, concluidas] = await Promise.all([
                buscarMissao(idMissao),
                usuario ? listarMissoesConcluidas() : Promise.resolve([]),
            ]);
            // Só conta a conclusão do período atual (diária/semanal/mensal reiniciam).
            return { missao, concluida: concluidas.some((um) => um.idMissao === idMissao && um.periodoAtual) };
        },
        `missao:${id}:${usuario?.idUsuario ?? "anon"}`,
        !carregandoSessao,
    );

    const missao = dados?.missao;
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [concluidaAgora, setConcluidaAgora] = useState(false);
    const concluida = concluidaAgora || Boolean(dados?.concluida);

    async function handleConcluir() {
        if (!missao) return;
        if (!usuario) {
            // Concluir missão grava no banco e soma pontos: exige login.
            navigate("/login", { state: { from: `/missoes/${missao.idMissao}` } });
            return;
        }
        setErro("");
        setSalvando(true);
        try {
            const resposta = await concluirMissao(missao.idMissao);
            atualizarSaldo(resposta.saldoPontos); // a API já devolve o saldo novo
            setConcluidaAgora(true);
            // Navegação programática: volta para a listagem após concluir.
            navigate("/missoes");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível concluir a missão.");
        } finally {
            setSalvando(false);
        }
    }

    if (carregando || carregandoSessao) {
        return (
            <div>
                <PageHero titulo="Missão" />
                <Carregando texto="Carregando missão..." />
            </div>
        );
    }

    if (erroCarga && status !== 404) {
        return (
            <div>
                <PageHero titulo="Missão" />
                <section className="px-4 py-14">
                    <ErroCarregar mensagem={erroCarga} onTentarNovamente={recarregar} />
                </section>
            </div>
        );
    }

    if (!missao) {
        return (
            <div>
                <PageHero titulo="Missão não encontrada" />
                <section className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
                    <p className="text-gray-600">
                        Não encontramos nenhuma missão com o identificador <code>{id}</code>.
                    </p>
                    <Button to="/missoes" variant="secondary" className="mt-6">
                        <FiArrowLeft /> Voltar para missões
                    </Button>
                </section>
            </div>
        );
    }

    return (
        <div>
            <PageHero titulo={missao.titulo}>
                <p>{missao.descricao}</p>
            </PageHero>

            <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                                {rotuloCategoria[missao.categoria]}
                            </span>
                            <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700">
                                {rotuloPeriodo[missao.periodo]}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gold-600">+{missao.pontosRecompensa} pontos</span>
                    </div>

                    <h3 className="mt-6 font-bold text-brand-900">Dicas para concluir</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                        {missao.dicas.map((dica) => (
                            <li key={dica}>{dica}</li>
                        ))}
                    </ul>

                    {erro && (
                        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                            {erro}
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                        {concluida ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700">
                                <FiCheckCircle /> {rotuloConcluidaNoPeriodo[missao.periodo]}
                                {missao.reiniciaEm && ` · reinicia em ${formatarDataHora(missao.reiniciaEm)}`}
                            </span>
                        ) : !missao.ativa ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-600">
                                Missão indisponível no momento
                            </span>
                        ) : (
                            <Button onClick={handleConcluir} disabled={salvando}>
                                <FiCheckCircle /> {salvando ? "Concluindo..." : usuario ? "Marcar como concluída" : "Entrar para concluir"}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            <FiArrowLeft /> Voltar
                        </Button>
                    </div>
                </Card>
            </section>
        </div>
    );
}
