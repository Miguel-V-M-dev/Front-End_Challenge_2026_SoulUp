import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import PageHero from "../components/ui/PageHero";
import { enviarContato } from "../services/ecoloopService";
import type { ContatoFormValues } from "../types";

export default function Contato() {
    const [modalAberto, setModalAberto] = useState(false);
    const [erro, setErro] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContatoFormValues>({
        mode: "onBlur",
        defaultValues: { nome: "", email: "", mensagem: "" },
    });

    async function onSubmit(dados: ContatoFormValues) {
        setErro("");
        try {
            await enviarContato(dados); // POST /api/contatos (público)
            setModalAberto(true);
            reset();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível enviar a mensagem.");
        }
    }

    const inputClasses = (temErro: boolean) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${temErro ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div>
            <PageHero titulo="Contato">
                <p>Dúvidas? Fale conosco, envie uma mensagem.</p>
            </PageHero>

            <section className="mx-auto max-w-xl px-4 py-14 sm:px-6">
                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="mb-1 block text-sm font-semibold text-brand-900">
                                Nome
                            </label>
                            <input
                                id="nome"
                                type="text"
                                className={inputClasses(Boolean(errors.nome))}
                                {...register("nome", {
                                    required: "Informe seu nome.",
                                    minLength: { value: 2, message: "Digite pelo menos 2 caracteres." },
                                })}
                            />
                            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-brand-900">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={inputClasses(Boolean(errors.email))}
                                {...register("email", {
                                    required: "Informe seu email.",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Informe um email válido.",
                                    },
                                })}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="mensagem" className="mb-1 block text-sm font-semibold text-brand-900">
                                Mensagem
                            </label>
                            <textarea
                                id="mensagem"
                                rows={5}
                                className={inputClasses(Boolean(errors.mensagem))}
                                {...register("mensagem", {
                                    required: "Escreva sua mensagem.",
                                    minLength: { value: 10, message: "Conte um pouco mais (mín. 10 caracteres)." },
                                })}
                            />
                            {errors.mensagem && <p className="mt-1 text-xs text-red-600">{errors.mensagem.message}</p>}
                        </div>

                        {erro && (
                            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                                {erro}
                            </p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Enviando..." : "Enviar"}
                        </Button>
                    </form>
                </Card>
            </section>

            <Modal aberto={modalAberto} variante="sucesso" onFechar={() => setModalAberto(false)}>
                <p className="font-semibold text-brand-900">Mensagem enviada com sucesso!</p>
                <p className="mt-1 text-sm">Obrigado por entrar em contato, retornaremos em breve.</p>
            </Modal>
        </div>
    );
}