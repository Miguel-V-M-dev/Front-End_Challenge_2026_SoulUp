import { FiRepeat, FiTrendingUp } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHero from "../components/ui/PageHero";

const destaques = [
    {
        icone: FiRepeat,
        titulo: "O que é",
        texto:
            "Uma plataforma de recompensas que permite aos usuários trocar pontos por benefícios de mobilidade urbana, com vouchers e códigos para uso em bilhetagem eletrônica.",
    },
    {
        icone: FiTrendingUp,
        titulo: "Como funciona",
        texto:
            "Os usuários acumulam pontos ao participar das ações e campanhas da SoulUp; a plataforma converte esses pontos em créditos (100 pontos = R$ 1,00) seguindo regras financeiras e controles antifraude.",
    },
    {
        icone: FaLeaf,
        titulo: "Benefícios",
        texto: "Redução de emissões, inclusão de usuários e incentivo ao transporte coletivo.",
    },
];

export default function Home() {
    return (
        <div>
            <PageHero titulo="Pontos que viram transporte">
                <p>Converta seus pontos SoulUp em créditos reais para deslocamento urbano.</p>
                <p>
                    Transforme recompensas em mobilidade: converta e receba um voucher para usar no
                    transporte público da sua cidade.
                </p>
                <div className="pt-4">
                    <Button to="/transporte" variant="ghost">
                        Converter meus pontos
                    </Button>
                </div>
            </PageHero>

            <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                {destaques.map(({ icone: Icone, titulo, texto }) => (
                    <Card key={titulo}>
                        <Icone className="mb-3 text-brand-500" size={28} />
                        <h2 className="text-lg font-bold text-brand-900">{titulo}</h2>
                        <p className="mt-2 text-sm text-gray-600">{texto}</p>
                    </Card>
                ))}
            </section>
        </div>
    );
}