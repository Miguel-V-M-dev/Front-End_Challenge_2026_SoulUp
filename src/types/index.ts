// Tipos alinhados ao modelo relacional da Sprint 4 (docs/ChallengeCreate.sql) e às
// respostas JSON da API EcoLoop. Missao.dicas_missao vira `dicas: string[]` e
// Usuario_missao.pontos_ganhos vira `pontosGanhos`.
// Cada interface abaixo corresponde a uma tabela; o comentário indica a
// coluna original. Datas são guardadas como string ISO (coluna DATE).

export interface TeamMember {
  id: number;
  nome: string;
  rm: string;
  turma: string;
  foto: string;
  github: string;
  linkedin: string;
}

export interface FaqEntry {
  id: string;
  pergunta: string;
  resposta: string;
}

// ---------- Tabela USUARIO ----------
export interface Usuario {
  idUsuario: number; // id_usuario
  nome: string; // nome_usuario VARCHAR2(100)
  email: string; // email_usuario VARCHAR2(60), UNIQUE
  pontos: number; // pontos_usuario, CHECK >= 0
  dataCadastro: string; // data_cadastro
}

/** Usuário como a API devolve (nunca inclui senha/hash). */
export type UsuarioSessao = Usuario;

// ---------- Tabela MISSAO ----------
// CHECK categoria_missao IN (...)
export type CategoriaMissao = "Transporte" | "Reciclagem" | "Energia" | "Alimentacao" | "Outro";

export interface Mission {
  idMissao: number; // id_missao
  titulo: string; // titulo_missao VARCHAR2(60)
  descricao: string; // descricao_missao VARCHAR2(255)
  pontosRecompensa: number; // pontos_recompensa, CHECK > 0
  categoria: CategoriaMissao; // categoria_missao
  ativa: boolean; // ativa CHAR(1): 'S' | 'N'
  dicas: string[]; // apenas conteúdo de interface (não existe na tabela)
}

/** Tipo de interseção: missão da API + estado de conclusão do usuário logado. */
export type MissaoComStatus = Mission & { concluida: boolean };

// ---------- Tabela USUARIO_MISSAO (PK composta usuario + missão) ----------
export interface UsuarioMissao {
  idUsuario: number;
  idMissao: number;
  dataConclusao: string; // data_conclusao
  pontosGanhos: number; // pontos creditados na conclusão
}

// ---------- Tabela CONVERSAOPONTOS ----------
export type StatusConversao = "PENDENTE" | "APROVADO" | "CANCELADO";

export interface ConversaoPontos {
  idConversao: number;
  pontosUtilizados: number; // CHECK > 0
  valorCredito: number; // NUMBER(10,2) = pontos_utilizados / 100
  dataConversao: string;
  status: StatusConversao;
  idUsuario: number;
}

// ---------- Tabela VOUCHER (1 voucher por conversão) ----------
export type StatusVoucher = "GERADO" | "UTILIZADO" | "EXPIRADO";
export type OperadorTransporte = "SPTrans" | "Metro SP" | "EMTU" | "CPTM" | "Outro";

export interface Voucher {
  idVoucher: number;
  codigoVoucher: string; // formato VCH-AAAA-NNNN, UNIQUE
  valorCreditoVoucher: number; // igual ao valor_credito da conversão
  dataEmissao: string;
  dataValidade: string; // CHECK data_validade > data_emissao
  statusVoucher: StatusVoucher;
  nomeOperadorTransporte: OperadorTransporte;
  idConversao: number; // UNIQUE
}

// ---------- Tabela IMPACTOAMBIENTAL ----------
export interface ImpactoAmbiental {
  idImpacto: number;
  kmPercorridos: number; // NUMBER(10,2), CHECK > 0
  co2Economizado: number; // NUMBER(10,4) = km x 0,17
  arvoresEquivalentes: number; // NUMBER(10,2) = co2 / 21
  dataRegistro: string;
  idUsuario: number;
}

// ---------- Formulários ----------
export interface ConversaoFormValues {
  pontos: number;
  operador: OperadorTransporte | "";
}

export interface ConversaoResultado {
  pontos: number;
  valorCredito: number;
  operador: OperadorTransporte;
  dataValidade: string;
  saldoApos: number;
}

// ---------- Respostas da API ----------
export interface AuthResposta {
  token: string;
  usuario: UsuarioSessao;
}

export interface ConclusaoResposta {
  idMissao: number;
  dataConclusao: string;
  pontosGanhos: number;
  saldoPontos: number;
}

export interface Simulacao {
  pontos: number;
  valorCredito: number;
  dataValidade: string;
  pontosMinimos: number;
  pontosPorReal: number;
}

export interface ConversaoResultadoApi {
  conversao: ConversaoPontos;
  voucher: Voucher;
  saldoPontos: number;
}

export interface ContatoResposta {
  idContato: number;
  dataEnvio: string;
}

export interface ConversaoHistoricoItem {
  conversao: ConversaoPontos;
  voucher: Voucher | null;
}

export interface ContatoFormValues {
  nome: string;
  email: string;
  mensagem: string;
}

export interface LoginFormValues {
  email: string;
  senha: string;
}

export interface CadastroFormValues {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface ImpactoFormValues {
  km: number;
}
