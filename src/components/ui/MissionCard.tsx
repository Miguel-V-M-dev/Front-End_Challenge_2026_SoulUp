import { FiCheckCircle, FiSlash } from "react-icons/fi";
import { Link } from "react-router-dom";
import { rotuloCategoria } from "../../data/categorias";
import type { Mission } from "../../types";
import Card from "./Card";

interface MissionCardProps {
    missao: Mission;
    concluida: boolean;
}

/** Card resumido de uma missão sustentável, usado na listagem /missoes. */
export default function MissionCard({ missao, concluida }: MissionCardProps) {
    return (
        <Card className={`flex flex-col gap-3 ${missao.ativa ? "" : "opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                    {rotuloCategoria[missao.categoria]}
                </span>
                {concluida && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
                        <FiCheckCircle size={16} /> Concluída
                    </span>
                )}
                {!missao.ativa && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <FiSlash size={14} /> Indisponível
                    </span>
                )}
            </div>

            <h2 className="text-lg font-bold text-brand-900">{missao.titulo}</h2>
            <p className="text-sm text-gray-600">{missao.descricao}</p>

            <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gold-600">+{missao.pontosRecompensa} pontos</span>
                <Link
                    to={`/missoes/${missao.idMissao}`}
                    className="text-sm font-semibold text-brand-700 underline-offset-2 hover:text-brand-900 hover:underline"
                >
                    Ver detalhes →
                </Link>
            </div>
        </Card>
    );
}
