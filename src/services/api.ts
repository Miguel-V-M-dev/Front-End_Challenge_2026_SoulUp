// Cliente HTTP da API EcoLoop. Centraliza: URL base, token Bearer, erros
// no formato { message } e tratamento de 401 em rotas protegidas.

export const API_URL = (import.meta.env.VITE_API_URL ?? "https://ecoloop-api-080c.onrender.com").replace(/\/$/, "");

const CHAVE_TOKEN = "soulup:token";
/** Evento disparado quando uma rota protegida devolve 401 (token vencido/ inválido). */
export const EVENTO_SESSAO_EXPIRADA = "soulup:sessao-expirada";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function lerToken(): string | null {
    try {
        return localStorage.getItem(CHAVE_TOKEN);
    } catch {
        return null;
    }
}

export function salvarToken(token: string): void {
    try {
        localStorage.setItem(CHAVE_TOKEN, token);
    } catch {
        // armazenamento indisponível: a sessão vale só até recarregar a página
    }
}

export function limparToken(): void {
    try {
        localStorage.removeItem(CHAVE_TOKEN);
    } catch {
        // ver salvarToken
    }
}

interface OpcoesRequisicao {
    metodo?: "GET" | "POST" | "PUT" | "DELETE";
    corpo?: unknown;
    /** false para rotas públicas e de login/cadastro (um 401 ali não é "sessão expirada"). */
    autenticada?: boolean;
}

export async function requisicao<T>(caminho: string, { metodo = "GET", corpo, autenticada = true }: OpcoesRequisicao = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (corpo !== undefined) headers["Content-Type"] = "application/json";

    const token = lerToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let resposta: Response;
    try {
        // Sem timeout de propósito: o servidor gratuito pode levar até 60 s para acordar.
        resposta = await fetch(`${API_URL}${caminho}`, {
            method: metodo,
            headers,
            body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
        });
    } catch {
        throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.", 0);
    }

    if (resposta.status === 401 && autenticada && token) {
        limparToken();
        window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }

    if (!resposta.ok) {
        let mensagem = `Erro inesperado (${resposta.status}).`;
        try {
            const dados = (await resposta.json()) as { message?: string };
            if (dados?.message) mensagem = dados.message;
        } catch {
            // corpo sem JSON: mantém a mensagem genérica
        }
        throw new ApiError(mensagem, resposta.status);
    }

    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
}
