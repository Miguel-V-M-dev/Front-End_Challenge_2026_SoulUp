import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import PageHero from "../components/ui/PageHero";
import { useAuth } from "../context/useAuth";
import { useApi } from "../hooks/useApi";
import { converterPontos, listarConversoes, simularConversao } from "../services/ecoloopService";
import type { ConversaoFormValues, ConversaoResultado } from "../types";
import { CONVERSAO_MINIMA_PONTOS, OPERADORES, PONTOS_POR_REAL, formatarData, formatarMoeda } from "../utils/conversao";

interface ModalState {
    aberto: boolean;
    variante: "neutro" | "sucesso" | "erro";
    titulo: string;
    corpo: string;
}

const modalFechado: ModalState = { aberto: false, variante: "neutro", titulo: "", corpo: "" };

const rotuloStatusVoucher = { GERADO: "Gerado", UTILIZADO: "Utilizado", EXPIRADO: "Expirado" } as const;

export default function Transporte() {
    // Rota protegida: aqui sempre há usuário logado.
    const { usuario, atualizarSaldo } = useAuth();
    const saldo = usuario?.pontos ?? 0;

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ConversaoFormValues>({ defaultValues: { pontos: undefined, operador: "" } });

    // useState nº3: resultado da simulação atual (antes da confirmação).
    const [resultado, setResultado] = useState<ConversaoResultado | null>(null);
    // useState nº4: estado do modal de feedback.
    const [modal, setModal] = useState<ModalState>(modalFechado);
    const [confirmando, setConfirmando] = useState(false);

    // Histórico: GET /api/conversoes (somente do usuário logado, mais recentes primeiro).
    const { dados: historico = [], erro: erroHistorico, definir } = useApi(
        listarConversoes,
        `conversoes:${usuario?.idUsuario ?? 0}`,
        Boolean(usuario),
    );

    // Simulação feita pela API: valor do crédito e validade não são calculados no front.
    async function onSimular(dados: ConversaoFormValues) {
        setResultado(null);
        try {
            const sim = await simularConversao(dados.pontos);
            setResultado({
                pontos: sim.pontos,
                valorCredito: sim.valorCredito,
                operador: dados.operador as ConversaoResultado["operador"],
                dataValidade: sim.dataValidade,
                saldoApos: saldo - sim.pontos,
            });
        } catch (e) {
            setError("pontos", { message: e instanceof Error ? e.message : "Não foi possível simular." });
        }
    }

    async function handleConfirmar() {
        if (!resultado || !usuario) return;
        setConfirmando(true);
        setModal({ aberto: true, variante: "neutro", titulo: "Processando...", corpo: "Validando sua solicitação." });

        try {
            const { conversao, voucher, saldoPontos } = await converterPontos(resultado.pontos, resultado.operador);
            atualizarSaldo(saldoPontos); // a API já devolve o saldo novo
            definir([{ conversao, voucher }, ...historico]);
            setResultado(null);
            reset({ pontos: undefined, operador: "" });
            setModal({
                aberto: true,
                variante: "sucesso",
                titulo: "Voucher gerado!",
                corpo: `Código: ${voucher.codigoVoucher} — ${formatarMoeda(voucher.valorCreditoVoucher)} (${voucher.nomeOperadorTransporte}), válido até ${formatarData(voucher.dataValidade)}.`,
            });
        } catch (e) {
            setModal({
                aberto: true,
                variante: "erro",
                titulo: "Não foi possível concluir",
                corpo: e instanceof Error ? e.message : "Tente novamente mais tarde.",
            });
        } finally {
            setConfirmando(false);
        }
    }

    const inputClasses = (temErro: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${temErro ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div>
            <PageHero titulo="Converter pontos em crédito de transporte">
                <p>Troque seus pontos por um voucher de transporte público, escolhendo a operadora.</p>
                <p className="text-sm text-brand-200">Saldo disponível: {saldo} pontos</p>
            </PageHero>

            <section className="mx-auto grid max-w-5xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_1fr]">
                <Card>
                    <h2 className="text-xl font-bold text-brand-900">Simulador de conversão</h2>

                    <form onSubmit={handleSubmit(onSimular)} noValidate className="mt-5 space-y-5">
                        <div>
                            <label htmlFor="pontos" className="mb-1 block text-sm font-semibold text-brand-900">
                                Pontos a converter
                            </label>
                            <input
                                id="pontos"
                                type="number"
                                step="1"
                                placeholder={`Ex: ${CONVERSAO_MINIMA_PONTOS * 2}`}
                                className={inputClasses(Boolean(errors.pontos))}
                                {...register("pontos", {
                                    required: "Informe a quantidade de pontos.",
                                    valueAsNumber: true,
                                    validate: (valor) => {
                                        if (!Number.isInteger(valor)) return "Informe um número inteiro de pontos.";
                                        if (valor < CONVERSAO_MINIMA_PONTOS) return `Conversão mínima: ${CONVERSAO_MINIMA_PONTOS} pontos.`;
                                        if (valor > saldo) return `Saldo insuficiente: você tem ${saldo} pontos.`;
                                        return true;
                                    },
                                })}
                            />
                            {errors.pontos && <p className="mt-1 text-xs text-red-600">{errors.pontos.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="operador" className="mb-1 block text-sm font-semibold text-brand-900">
                                Operadora de transporte
                            </label>
                            <select
                                id="operador"
                                className={inputClasses(Boolean(errors.operador))}
                                {...register("operador", { required: "Selecione a operadora." })}
                            >
                                <option value="">Selecione</option>
                                {OPERADORES.map((operador) => (
                                    <option key={operador} value={operador}>
                                        {operador}
                                    </option>
                                ))}
                            </select>
                            {errors.operador && <p className="mt-1 text-xs text-red-600">{errors.operador.message}</p>}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Simulando..." : "Simular"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    reset({ pontos: undefined, operador: "" });
                                    setResultado(null);
                                }}
                            >
                                Limpar
                            </Button>
                        </div>
                    </form>

                    {resultado && (
                        <div className="mt-6 rounded-xl bg-brand-50 p-5" aria-live="polite">
                            <p>
                                <strong>Pontos utilizados:</strong> {resultado.pontos}
                            </p>
                            <p>
                                <strong>Valor do crédito:</strong> {formatarMoeda(resultado.valorCredito)}
                            </p>
                            <p>
                                <strong>Operadora:</strong> {resultado.operador}
                            </p>
                            <p>
                                <strong>Validade do voucher:</strong> {formatarData(resultado.dataValidade)}
                            </p>
                            <p>
                                <strong>Saldo após a conversão:</strong> {resultado.saldoApos} pontos
                            </p>
                            <Button className="mt-4" onClick={handleConfirmar} disabled={confirmando}>
                                {confirmando ? "Processando..." : "Confirmar conversão"}
                            </Button>
                        </div>
                    )}
                </Card>

                <aside className="space-y-6">
                    <Card>
                        <h3 className="font-bold text-brand-900">Como funciona a conversão</h3>
                        <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-gray-600">
                            <li>Você informa quantos pontos quer converter e a operadora.</li>
                            <li>O simulador mostra o valor do crédito e a validade do voucher.</li>
                            <li>Ao confirmar, os pontos saem do seu saldo e o voucher é gerado na hora.</li>
                        </ol>
                        <h4 className="mt-4 font-semibold text-brand-900">Regras de negócio</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-600">
                            <li>Conversão mínima: {CONVERSAO_MINIMA_PONTOS} pontos.</li>
                            <li>{PONTOS_POR_REAL} pontos = R$ 1,00 em crédito.</li>
                            <li>O voucher tem prazo de validade, informado na simulação.</li>
                            <li>Não é possível converter mais pontos do que o saldo.</li>
                        </ul>
                    </Card>

                    {erroHistorico && (
                        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                            Não foi possível carregar o histórico: {erroHistorico}
                        </p>
                    )}

                    {historico.length > 0 && (
                        <Card>
                            <h3 className="font-bold text-brand-900">Últimas conversões</h3>
                            <ul className="mt-3 space-y-3 text-sm">
                                {historico.slice(0, 5).map(({ conversao, voucher }) => (
                                    <li key={conversao.idConversao} className="border-b border-gray-100 pb-2 last:border-none">
                                        <p className="font-semibold text-brand-900">{formatarMoeda(conversao.valorCredito)}</p>
                                        <p className="text-xs text-gray-500">
                                            {voucher
                                                ? `${voucher.nomeOperadorTransporte} · ${voucher.codigoVoucher} · ${rotuloStatusVoucher[voucher.statusVoucher]}`
                                                : `Sem voucher · ${conversao.status}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </aside>
            </section>

            <Modal aberto={modal.aberto} variante={modal.variante} onFechar={() => setModal(modalFechado)}>
                <p className="font-semibold text-brand-900">{modal.titulo}</p>
                <p className="mt-1 text-sm">{modal.corpo}</p>
            </Modal>
        </div>
    );
}
