import type { CategoriaMissao, PeriodoMissao } from "../types";

// O valor da API não tem acento ("Alimentacao"); aqui só o rótulo exibido.
export const rotuloCategoria: Record<CategoriaMissao, string> = {
    Transporte: "Transporte",
    Reciclagem: "Reciclagem",
    Energia: "Energia",
    Alimentacao: "Alimentação",
    Outro: "Outro",
};

// Texto do selo de periodicidade ("Única" não mostra selo).
export const rotuloPeriodo: Record<PeriodoMissao, string> = {
    UNICA: "Única",
    DIARIA: "Diária",
    SEMANAL: "Semanal",
    MENSAL: "Mensal",
};

// "Concluída hoje / nesta semana / neste mês", conforme a periodicidade.
export const rotuloConcluidaNoPeriodo: Record<PeriodoMissao, string> = {
    UNICA: "Concluída",
    DIARIA: "Concluída hoje",
    SEMANAL: "Concluída nesta semana",
    MENSAL: "Concluída neste mês",
};
