import type {
    ConclusaoResposta,
    ContatoFormValues,
    ContatoResposta,
    ConversaoHistoricoItem,
    ConversaoResultadoApi,
    ImpactoAmbiental,
    Mission,
    OperadorTransporte,
    Simulacao,
    UsuarioMissao,
} from "../types";
import { requisicao } from "./api";

// Todas as regras de negócio (valores, validade, voucher, CO₂) vivem na API.

// ---------- Missões ----------
export const listarMissoes = () => requisicao<Mission[]>("/api/missoes", { autenticada: false });

export const buscarMissao = (id: number) => requisicao<Mission>(`/api/missoes/${id}`, { autenticada: false });

export const listarMissoesConcluidas = () => requisicao<UsuarioMissao[]>("/api/missoes/concluidas");

export const concluirMissao = (idMissao: number) =>
    requisicao<ConclusaoResposta>(`/api/missoes/${idMissao}/concluir`, { metodo: "POST" });

// ---------- Conversão de pontos ----------
export const simularConversao = (pontos: number) =>
    requisicao<Simulacao>(`/api/conversoes/simulacao?pontos=${encodeURIComponent(pontos)}`);

export const converterPontos = (pontos: number, operador: OperadorTransporte) =>
    requisicao<ConversaoResultadoApi>("/api/conversoes", { metodo: "POST", corpo: { pontos, operador } });

export const listarConversoes = () => requisicao<ConversaoHistoricoItem[]>("/api/conversoes");

// ---------- Impacto ambiental ----------
export const registrarImpacto = (km: number) =>
    requisicao<ImpactoAmbiental>("/api/impactos", { metodo: "POST", corpo: { km } });

export const listarImpactos = () => requisicao<ImpactoAmbiental[]>("/api/impactos");

// ---------- Contato (público) ----------
export const enviarContato = (dados: ContatoFormValues) =>
    requisicao<ContatoResposta>("/api/contatos", { metodo: "POST", corpo: dados, autenticada: false });
