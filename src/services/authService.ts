import type { AuthResposta, UsuarioSessao } from "../types";
import { limparToken, requisicao, salvarToken } from "./api";

export function normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
}

/** POST /api/auth/login — a senha vai em texto puro, por HTTPS; o hash é feito na API. */
export async function autenticar(email: string, senha: string): Promise<UsuarioSessao> {
    const { token, usuario } = await requisicao<AuthResposta>("/api/auth/login", {
        metodo: "POST",
        corpo: { email: normalizarEmail(email), senha },
        autenticada: false,
    });
    salvarToken(token);
    return usuario;
}

/** POST /api/auth/cadastro — confirmarSenha não é enviado. */
export async function cadastrar(dados: { nome: string; email: string; senha: string }): Promise<UsuarioSessao> {
    const { token, usuario } = await requisicao<AuthResposta>("/api/auth/cadastro", {
        metodo: "POST",
        corpo: { nome: dados.nome.trim(), email: normalizarEmail(dados.email), senha: dados.senha },
        autenticada: false,
    });
    salvarToken(token);
    return usuario;
}

/** GET /api/auth/me — restaura a sessão ao abrir o app. */
export function usuarioDaSessao(): Promise<UsuarioSessao> {
    return requisicao<UsuarioSessao>("/api/auth/me");
}

/** Encerrar sessão = apagar o token (não há endpoint). */
export function encerrarSessao(): void {
    limparToken();
}
