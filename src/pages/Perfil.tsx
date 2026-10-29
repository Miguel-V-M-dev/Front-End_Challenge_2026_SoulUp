import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AvatarUsuario from "../components/ui/AvatarUsuario";
import { useAuth } from "../context/useAuth";
import { Carregando, ErroCarregar } from "../components/ui/Estado";
import { useApi } from "../hooks/useApi";
import {
    listarConversoes,
    listarImpactos,
    listarMissoes,
    listarMissoesConcluidas,
    registrarImpacto,
} from "../services/ecoloopService";
import type { ImpactoFormValues } from "../types";
import { CO2_KG_POR_KM, formatarData, formatarMoeda } from "../utils/conversao";

export default function Perfil() {
    // Rota protegida: aqui sempre há usuário logado.
    const { usuario } = useAuth();

    // Tudo vem da API; o token identifica o usuário (não há id na URL).
    const { dados, erro: erroCarga, carregando, recarregar, definir } = useApi(
        async () => {
            const [missions, concluidas, conversoes, impactos] = await Promise.all([
                listarMissoes(),
                listarMissoesConcluidas(),
                listarConversoes(),
                listarImpactos(),
            ]);
            return { missions, concluidas, conversoes, impactos };
        },
        `perfil:${usuario?.idUsuario ?? 0}`,
        Boolean(usuario),
    );

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ImpactoFormValues>({ defaultValues: { km: undefined } });

    async function onRegistrarImpacto({ km }: ImpactoFormValues) {
        if (!dados) return;
        setErro("");
        setSalvando(true);
        try {
            const novo = await registrarImpacto(km);
            definir({ ...dados, impactos: [novo, ...dados.impactos] }); // mais recentes primeiro
            reset({ km: undefined });
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível registrar.");
        } finally {
            setSalvando(false);
        }
    }

    const missions = dados?.missions ?? [];
    const concluidas = dados?.concluidas ?? [];
    const conversoes = dados?.conversoes ?? [];
    const impactos = dados?.impactos ?? [];
    const totalKm = impactos.reduce((soma, i) => soma + i.kmPercorridos, 0);
    const totalCo2 = impactos.reduce((soma, i) => soma + i.co2Economizado, 0);
    const totalArvores = impactos.reduce((soma, i) => soma + i.arvoresEquivalentes, 0);

    if (!usuario) return null;

    const inputClasses = (temErro: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${temErro ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div>
            {/* Avatar à esquerda; nome, e-mail e data de cadastro à direita */}
            <section className="bg-brand-900 px-4 py-12 text-white sm:px-6 sm:py-16">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:gap-10">
                    <AvatarUsuario key={usuario.idUsuario} idUsuario={usuario.idUsuario} />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-extrabold sm:text-4xl">Olá, {usuario.nome.split(" ")[0]}!</h1>
                        <p className="mt-3 break-all text-brand-100 sm:text-lg">{usuario.email}</p>
                        <p className="mt-1 text-sm text-brand-200">Membro desde {formatarData(usuario.dataCadastro)}</p>
                    </div>
                </div>
            </section>

            {carregando ? (
                <Carregando texto="Carregando seu perfil..." />
            ) : erroCarga ? (
                <section className="px-4 py-14">
                    <ErroCarregar mensagem={erroCarga} onTentarNovamente={recarregar} />
                </section>
            ) : (
                <section className="mx-auto grid max-w-5xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
                    <Card className="md:col-span-2">
                        <p className="text-sm text-gray-500">Saldo de pontos</p>
                        <p className="text-4xl font-extrabold text-brand-900">{usuario.pontos}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Button to="/transporte">Converter pontos</Button>
                            <Button to="/missoes" variant="secondary">
                                Ver missões
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-bold text-brand-900">Missões concluídas</h2>
                        {concluidas.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">Você ainda não concluiu nenhuma missão.</p>
                        ) : (
                            <ul className="mt-3 space-y-2 text-sm">
                                {concluidas.map((um) => {
                                    const missao = missions.find((m) => m.idMissao === um.idMissao);
                                    return (
                                        <li key={`${um.idMissao}-${um.dataConclusao}`} className="flex justify-between gap-3 border-b border-gray-100 pb-2 last:border-none">
                                            <span>{missao?.titulo ?? `Missão ${um.idMissao}`}</span>
                                            <span className="shrink-0 text-gray-500">
                                                {formatarData(um.dataConclusao)} · +{um.pontosGanhos}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>

                    <Card>
                        <h2 className="text-lg font-bold text-brand-900">Vouchers e conversões</h2>
                        {conversoes.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-600">Nenhuma conversão realizada ainda.</p>
                        ) : (
                            <ul className="mt-3 space-y-3 text-sm">
                                {conversoes.map(({ conversao, voucher }) => (
                                    <li key={conversao.idConversao} className="border-b border-gray-100 pb-2 last:border-none">
                                        <p className="font-semibold text-brand-900">
                                            {formatarMoeda(conversao.valorCredito)} · {conversao.pontosUtilizados} pontos
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatarData(conversao.dataConversao)} · {conversao.status}
                                            {voucher &&
                                                ` · ${voucher.nomeOperadorTransporte} · ${voucher.codigoVoucher} (${voucher.statusVoucher})`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card className="md:col-span-2">
                        <h2 className="text-lg font-bold text-brand-900">Meu impacto ambiental</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Registre os quilômetros feitos de forma sustentável. Cada km evita {String(CO2_KG_POR_KM).replace(".", ",")} kg de CO₂.
                        </p>

                        <div className="mt-4 grid gap-3 text-center sm:grid-cols-3">
                            <div className="rounded-xl bg-brand-50 p-3">
                                <p className="text-xl font-bold text-brand-900">{totalKm.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km</p>
                                <p className="text-xs text-gray-600">percorridos</p>
                            </div>
                            <div className="rounded-xl bg-brand-50 p-3">
                                <p className="text-xl font-bold text-brand-900">{totalCo2.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} kg</p>
                                <p className="text-xs text-gray-600">de CO₂ economizado</p>
                            </div>
                            <div className="rounded-xl bg-brand-50 p-3">
                                <p className="text-xl font-bold text-brand-900">{totalArvores.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</p>
                                <p className="text-xs text-gray-600">árvores equivalentes</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onRegistrarImpacto)} noValidate className="mt-5 flex flex-wrap items-start gap-3">
                            <div className="min-w-48 flex-1">
                                <label htmlFor="km" className="sr-only">
                                    Quilômetros percorridos
                                </label>
                                <input
                                    id="km"
                                    type="number"
                                    step="0.01"
                                    placeholder="Km percorridos (ex: 12,5)"
                                    className={inputClasses(Boolean(errors.km))}
                                    {...register("km", {
                                        required: "Informe os quilômetros.",
                                        valueAsNumber: true,
                                        validate: (valor) =>
                                            (Number.isFinite(valor) && valor > 0 && valor <= 99999999) || "Informe um valor maior que zero.",
                                    })}
                                />
                                {errors.km && <p className="mt-1 text-xs text-red-600">{errors.km.message}</p>}
                            </div>
                            <Button type="submit" disabled={salvando}>
                                {salvando ? "Registrando..." : "Registrar"}
                            </Button>
                        </form>
                        {erro && <p role="alert" className="mt-2 text-sm text-red-600">{erro}</p>}
                    </Card>
                </section>
            )}
        </div>
    );
}
