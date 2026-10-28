import { createContext } from "react";
import type { UsuarioSessao } from "../types";

export interface AuthContextValue {
    /** Usuário logado ou null. Nunca contém a senha/hash. */
    usuario: UsuarioSessao | null;
    /** true enquanto o app restaura a sessão (GET /api/auth/me) ao abrir. */
    carregando: boolean;
    entrar: (email: string, senha: string) => Promise<void>;
    cadastrar: (dados: { nome: string; email: string; senha: string }) => Promise<void>;
    sair: () => void;
    /** Atualiza o saldo com o `saldoPontos` devolvido pela API (concluir missão / converter). */
    atualizarSaldo: (pontos: number) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
