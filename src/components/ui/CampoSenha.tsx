import { useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface CampoSenhaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
    temErro?: boolean;
}

/**
 * Campo de senha com botão de olho para mostrar/esconder o texto.
 * Aceita as mesmas props de um <input> (inclusive o `{...register("campo")}` do react-hook-form).
 */
export default function CampoSenha({ temErro = false, ...props }: CampoSenhaProps) {
    const [visivel, setVisivel] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={visivel ? "text" : "password"}
                className={`w-full rounded-lg border py-2.5 pl-4 pr-11 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
                    temErro ? "border-red-500" : "border-gray-300"
                }`}
            />
            <button
                type="button"
                onClick={() => setVisivel((atual) => !atual)}
                aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
                aria-pressed={visivel}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 hover:text-brand-900"
            >
                {visivel ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
        </div>
    );
}
