import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHero from "../components/ui/PageHero";
import { useAuth } from "../context/useAuth";
import type { CadastroFormValues } from "../types";

export default function Cadastro() {
    const { usuario, cadastrar } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const destino = (location.state as { from?: string } | null)?.from ?? "/";

    const [erro, setErro] = useState("");
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<CadastroFormValues>({
        mode: "onBlur",
        defaultValues: { nome: "", email: "", senha: "", confirmarSenha: "" },
    });

    if (usuario) return <Navigate to={destino} replace />;

    async function onSubmit({ nome, email, senha }: CadastroFormValues) {
        setErro("");
        try {
            await cadastrar({ nome, email, senha });
            navigate(destino, { replace: true });
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível criar a conta.");
        }
    }

    const inputClasses = (temErro: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${temErro ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div>
            <PageHero titulo="Criar conta">
                <p>Cadastre-se para acumular pontos, concluir missões e gerar vouchers de transporte.</p>
            </PageHero>

            <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="mb-1 block text-sm font-semibold text-brand-900">
                                Nome completo
                            </label>
                            <input
                                id="nome"
                                type="text"
                                autoComplete="name"
                                className={inputClasses(Boolean(errors.nome))}
                                {...register("nome", {
                                    required: "Informe seu nome.",
                                    minLength: { value: 3, message: "Digite pelo menos 3 caracteres." },
                                    maxLength: { value: 100, message: "Máximo de 100 caracteres." }, // nome_usuario VARCHAR2(100)
                                })}
                            />
                            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>}
                        </div>

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
                                    maxLength: { value: 60, message: "Máximo de 60 caracteres." }, // email_usuario VARCHAR2(60)
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Informe um e-mail válido." },
                                })}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="senha" className="mb-1 block text-sm font-semibold text-brand-900">
                                Senha
                            </label>
                            <input
                                id="senha"
                                type="password"
                                autoComplete="new-password"
                                className={inputClasses(Boolean(errors.senha))}
                                {...register("senha", {
                                    required: "Crie uma senha.",
                                    minLength: { value: 8, message: "Use pelo menos 8 caracteres." },
                                    validate: (valor) =>
                                        (/[A-Za-z]/.test(valor) && /\d/.test(valor)) || "Use letras e números.",
                                })}
                            />
                            {errors.senha && <p className="mt-1 text-xs text-red-600">{errors.senha.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmarSenha" className="mb-1 block text-sm font-semibold text-brand-900">
                                Confirmar senha
                            </label>
                            <input
                                id="confirmarSenha"
                                type="password"
                                autoComplete="new-password"
                                className={inputClasses(Boolean(errors.confirmarSenha))}
                                {...register("confirmarSenha", {
                                    required: "Repita a senha.",
                                    validate: (valor) => valor === getValues("senha") || "As senhas não coincidem.",
                                })}
                            />
                            {errors.confirmarSenha && (
                                <p className="mt-1 text-xs text-red-600">{errors.confirmarSenha.message}</p>
                            )}
                        </div>

                        {erro && (
                            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                                {erro}
                            </p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Criando conta..." : "Criar conta"}
                        </Button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-600">
                        Já tem conta?{" "}
                        <Link to="/login" state={{ from: destino }} className="font-semibold text-brand-700 hover:underline">
                            Entrar
                        </Link>
                    </p>
                </Card>
            </section>
        </div>
    );
}
