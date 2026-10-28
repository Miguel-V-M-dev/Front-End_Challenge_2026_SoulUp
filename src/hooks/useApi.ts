import { useCallback, useEffect, useState } from "react";

interface Estado<T> {
    chave: string;
    dados?: T;
    erro?: string;
    status?: number;
}

/**
 * Executa uma chamada assíncrona e expõe { dados, erro, carregando }.
 * - `chave` identifica a consulta: quando muda, a consulta roda de novo.
 * - `ativo=false` adia a chamada (ex.: enquanto a sessão ainda é restaurada).
 * - `definir` troca os dados localmente (útil após POST, sem nova busca).
 */
export function useApi<T>(buscar: () => Promise<T>, chave: string, ativo = true) {
    const [tentativa, setTentativa] = useState(0);
    const chaveCompleta = `${chave}#${tentativa}`;
    const [estado, setEstado] = useState<Estado<T> | null>(null);

    useEffect(() => {
        if (!ativo) return;
        let cancelado = false;
        buscar()
            .then((dados) => !cancelado && setEstado({ chave: chaveCompleta, dados }))
            .catch((e: unknown) => {
                if (cancelado) return;
                setEstado({
                    chave: chaveCompleta,
                    erro: e instanceof Error ? e.message : "Não foi possível carregar os dados.",
                    status: (e as { status?: number }).status,
                });
            });
        return () => {
            cancelado = true;
        };
        // `buscar` é recriada a cada render; a chave controla quando refazer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaveCompleta, ativo]);

    const atual = estado?.chave === chaveCompleta ? estado : null;
    const definir = useCallback(
        (dados: T) => setEstado({ chave: chaveCompleta, dados }),
        [chaveCompleta],
    );

    return {
        dados: atual?.dados,
        erro: atual?.erro,
        status: atual?.status,
        carregando: !atual,
        recarregar: () => setTentativa((n) => n + 1),
        definir,
    };
}
