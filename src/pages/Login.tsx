import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import CampoSenha from "../components/ui/CampoSenha";
import Card from "../components/ui/Card";
import PageHero from "../components/ui/PageHero";
import { useAuth } from "../context/useAuth";
import type { LoginFormValues } from "../types";

export default function Login() {
    const { usuario, entrar } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // "from" é preenchido pela RotaProtegida com a página que o usuário tentou abrir.
    const origem = (location.state as { from?: string } | null)?.from;
    const destino = origem ?? "/";

    const [erro, setErro] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({ mode: "onBlur", defaultValues: { email: "", senha: "" } });

    // Já logado: não faz sentido ver o formulário.
    if (usuario) return <Navigate to={destino} replace />;

    async function onSubmit({ email, senha }: LoginFormValues) {
        setErro("");
        try {
            await entrar(email, senha);
            navigate(destino, { replace: true });
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível entrar.");
        }
    }

    const inputClasses = (temErro: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${temErro ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div>
            <PageHero titulo="Entrar">
                <p>Acesse sua conta para converter pontos e concluir missões.</p>
            </PageHero>

            <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-brand-900">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={inputClasses(Boolean(errors.email))}
                                {...register("email", {
                                    required: "Informe seu e-mail.",
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Informe um e-mail válido." },
                                })}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="senha" className="mb-1 block text-sm font-semibold text-brand-900">
                                Senha
                            </label>
                            <CampoSenha
                                id="senha"
                                autoComplete="current-password"
                                temErro={Boolean(errors.senha)}
                                {...register("senha", { required: "Informe sua senha." })}
                            />
                            {errors.senha && <p className="mt-1 text-xs text-red-600">{errors.senha.message}</p>}
                        </div>

                        {origem && !erro && (
                            <p role="status" className="rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
                                Faça login para acessar <strong>{origem}</strong>.
                            </p>
                        )}

                        {erro && (
                            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                                {erro}
                            </p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-600">
                        Ainda não tem conta?{" "}
                        <Link to="/cadastro" state={{ from: destino }} className="font-semibold text-brand-700 hover:underline">
                            Cadastre-se
                        </Link>
                    </p>
                </Card>
            </section>
        </div>
    );
}
