import { useState } from "react";
import { FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const links = [
    { to: "/", label: "Home", end: true },
    { to: "/sobre", label: "Sobre" },
    { to: "/integrantes", label: "Integrantes" },
    { to: "/missoes", label: "Missões" },
    { to: "/faq", label: "FAQ" },
    { to: "/contato", label: "Contato" },
];

export default function Header() {
    // useState nº1 do componente: controla a visibilidade do menu mobile.
    const [menuAberto, setMenuAberto] = useState(false);
    const { usuario, sair } = useAuth();
    const navigate = useNavigate();

    const primeiroNome = usuario?.nome.split(" ")[0];

    function handleSair() {
        sair();
        setMenuAberto(false);
        navigate("/");
    }

    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4 ${isActive ? "bg-brand-900 text-white" : "text-brand-900 hover:bg-brand-50"
        }`;

    return (
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <NavLink to="/" className="shrink-0 whitespace-nowrap text-lg font-extrabold tracking-tight text-brand-900">
                    SoulUp <span className="text-gold-500">| Ecoloop</span>
                </NavLink>

                {/* Navegação desktop (a partir de 1024px; abaixo disso vira menu hambúrguer) */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
                            {link.label}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/transporte"
                        className="ml-2 whitespace-nowrap rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-gold-400"
                    >
                        Converter pontos
                    </NavLink>

                    {usuario ? (
                        <>
                            <NavLink to="/perfil" className={linkClasses}>
                                <span className="inline-flex items-center gap-1">
                                    <FiUser /> {primeiroNome}
                                </span>
                            </NavLink>
                            <button
                                type="button"
                                onClick={handleSair}
                                aria-label="Sair da conta"
                                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            >
                                <FiLogOut /> Sair
                            </button>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className="rounded-full border-2 border-brand-900 px-4 py-1.5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
                        >
                            Entrar
                        </NavLink>
                    )}
                </nav>

                {/* Botão hambúrguer (celular e tablet, abaixo de 1024px) */}
                <button
                    type="button"
                    className="rounded-full p-2 text-brand-900 hover:bg-brand-50 lg:hidden"
                    aria-haspopup="true"
                    aria-expanded={menuAberto}
                    aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                    onClick={() => setMenuAberto((atual) => !atual)}
                >
                    {menuAberto ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Dropdown do menu hambúrguer */}
            {menuAberto && (
                <nav className="flex flex-col gap-1 border-t border-black/5 bg-white px-4 py-3 lg:hidden">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            onClick={() => setMenuAberto(false)}
                            className={linkClasses}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/transporte"
                        onClick={() => setMenuAberto(false)}
                        className="mt-1 rounded-full bg-gold-500 px-4 py-2 text-center text-sm font-semibold text-brand-950 hover:bg-gold-400"
                    >
                        Converter pontos
                    </NavLink>

                    {usuario ? (
                        <>
                            <NavLink to="/perfil" onClick={() => setMenuAberto(false)} className={linkClasses}>
                                Meu perfil ({primeiroNome})
                            </NavLink>
                            <button
                                type="button"
                                onClick={handleSair}
                                className="rounded-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" onClick={() => setMenuAberto(false)} className={linkClasses}>
                            Entrar
                        </NavLink>
                    )}
                </nav>
            )}
        </header>
    );
}
