import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { EVENTO_SESSAO_EXPIRADA, lerToken, limparToken } from "../services/api";
import { autenticar, cadastrar as cadastrarUsuario, encerrarSessao, usuarioDaSessao } from "../services/authService";
import type { UsuarioSessao } from "../types";
import { AuthContext, type AuthContextValue } from "./authContext";

/** Disponibiliza o usuário logado e as ações de login/cadastro/logout para o app todo. */
export default function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
    // Só há o que restaurar se existir token guardado.
    const [carregando, setCarregando] = useState<boolean>(() => lerToken() !== null);

    // Ao abrir o app: restaura a sessão com GET /api/auth/me.
    useEffect(() => {
        if (!lerToken()) return;
        let cancelado = false;
        usuarioDaSessao()
            .then((u) => !cancelado && setUsuario(u))
            .catch((e: unknown) => {
                // 401 já limpa o token em api.ts; outros erros (rede) mantêm o token, mas sem usuário.
                if ((e as { status?: number }).status === 401) limparToken();
            })
            .finally(() => !cancelado && setCarregando(false));
        return () => {
            cancelado = true;
        };
    }, []);

    // 401 em qualquer rota protegida: derruba a sessão (a RotaProtegida manda para /login).
    useEffect(() => {
        const aoExpirar = () => setUsuario(null);
        window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
        return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    }, []);

    const entrar = useCallback(async (email: string, senha: string) => {
        setUsuario(await autenticar(email, senha));
    }, []);

    const cadastrar = useCallback(async (dados: { nome: string; email: string; senha: string }) => {
        setUsuario(await cadastrarUsuario(dados));
    }, []);

    const sair = useCallback(() => {
        encerrarSessao();
        setUsuario(null);
    }, []);

    const atualizarSaldo = useCallback((pontos: number) => {
        setUsuario((atual) => (atual ? { ...atual, pontos } : atual));
    }, []);

    const valor = useMemo<AuthContextValue>(
        () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarSaldo }),
        [usuario, carregando, entrar, cadastrar, sair, atualizarSaldo],
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
