import type { OperadorTransporte } from "../types";

// Os cálculos (valor do crédito, validade, código do voucher, CO₂, árvores)
// agora vêm da API. Aqui ficam só constantes de exibição e formatação.
export const PONTOS_POR_REAL = 100; // texto informativo; a simulação da API é a fonte da verdade
export const CONVERSAO_MINIMA_PONTOS = 100; // validação rápida no formulário; a API revalida
export const CO2_KG_POR_KM = 0.17; // texto informativo

// Valores aceitos pela API em "operador"
export const OPERADORES: OperadorTransporte[] = ["SPTrans", "Metro SP", "EMTU", "CPTM", "Outro"];

/** Formata um número como moeda BRL. */
export function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Formata uma data ISO (ex.: 2026-10-24T16:26:29) como dd/mm/aaaa. */
export function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString("pt-BR");
}
