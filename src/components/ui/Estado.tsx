import Button from "./Button";

/** Mensagem de carregamento (a 1ª chamada pode levar até 60 s se o servidor estiver dormindo). */
export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
    return (
        <div role="status" className="py-14 text-center text-sm text-gray-600">
            <p>{texto}</p>
            <p className="mt-1 text-xs text-gray-400">
                Na primeira visita o servidor pode levar até 1 minuto para acordar.
            </p>
        </div>
    );
}

export function ErroCarregar({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente?: () => void }) {
    return (
        <div role="alert" className="mx-auto max-w-xl rounded-lg bg-red-50 px-4 py-4 text-center text-sm text-red-700">
            <p>{mensagem}</p>
            {onTentarNovamente && (
                <Button variant="secondary" className="mt-3" onClick={onTentarNovamente}>
                    Tentar novamente
                </Button>
            )}
        </div>
    );
}
