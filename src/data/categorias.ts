import type { CategoriaMissao } from "../types";

// O valor da API não tem acento ("Alimentacao"); aqui só o rótulo exibido.
export const rotuloCategoria: Record<CategoriaMissao, string> = {
    Transporte: "Transporte",
    Reciclagem: "Reciclagem",
    Energia: "Energia",
    Alimentacao: "Alimentação",
    Outro: "Outro",
};
