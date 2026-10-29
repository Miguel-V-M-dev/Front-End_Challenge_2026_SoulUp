import { useState, type ChangeEvent } from "react";
import { FiPlus, FiUser } from "react-icons/fi";
import Button from "./Button";
import Modal from "./Modal";

interface AvatarUsuarioProps {
    idUsuario: number;
}

/** Foto de perfil: um emoji ou uma imagem enviada pelo usuário. */
interface Avatar {
    tipo: "emoji" | "imagem";
    valor: string; // o emoji em si, ou a imagem em base64 (data URL)
}

const EMOJIS = ["🌱", "🌿", "🌳", "♻️", "🚌", "🚲", "🚆", "🌎", "☀️", "🦋", "🐢", "🦊", "🐼", "😀", "😎", "🤩"];
const TAMANHO_MAXIMO_KB = 500;

// Cada usuário tem a sua chave, então duas contas no mesmo navegador não misturam avatares.
const chaveAvatar = (idUsuario: number) => `soulup:avatar:${idUsuario}`;

function lerAvatar(idUsuario: number): Avatar | null {
    try {
        const salvo = localStorage.getItem(chaveAvatar(idUsuario));
        return salvo ? (JSON.parse(salvo) as Avatar) : null;
    } catch {
        return null;
    }
}

/**
 * Círculo com o avatar do usuário e um botão "+" para trocá-lo.
 * A API não guarda foto, então a escolha fica salva no localStorage deste navegador.
 */
export default function AvatarUsuario({ idUsuario }: AvatarUsuarioProps) {
    // Função no useState: lê o localStorage só na primeira renderização.
    const [avatar, setAvatar] = useState<Avatar | null>(() => lerAvatar(idUsuario));
    const [modalAberto, setModalAberto] = useState(false);
    const [erro, setErro] = useState("");

    function salvar(novo: Avatar | null) {
        setAvatar(novo);
        try {
            if (novo) localStorage.setItem(chaveAvatar(idUsuario), JSON.stringify(novo));
            else localStorage.removeItem(chaveAvatar(idUsuario));
        } catch {
            setErro("Não foi possível salvar a imagem neste navegador.");
        }
    }

    function escolherEmoji(emoji: string) {
        setErro("");
        salvar({ tipo: "emoji", valor: emoji });
        setModalAberto(false);
    }

    function escolherImagem(e: ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            setErro("Escolha um arquivo de imagem (JPG, PNG, WEBP...).");
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO_KB * 1024) {
            setErro(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_KB} KB.`);
            return;
        }

        // FileReader transforma o arquivo em texto (base64) para guardarmos no localStorage.
        const leitor = new FileReader();
        leitor.onload = () => {
            setErro("");
            salvar({ tipo: "imagem", valor: String(leitor.result) });
            setModalAberto(false);
        };
        leitor.onerror = () => setErro("Não foi possível ler a imagem.");
        leitor.readAsDataURL(arquivo);
        e.target.value = ""; // permite escolher o mesmo arquivo de novo
    }

    function remover() {
        setErro("");
        salvar(null);
        setModalAberto(false);
    }

    return (
        <>
            <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-brand-200 bg-brand-800 text-5xl sm:h-32 sm:w-32">
                    {avatar?.tipo === "imagem" ? (
                        <img src={avatar.valor} alt="Sua foto de perfil" className="h-full w-full object-cover" />
                    ) : avatar?.tipo === "emoji" ? (
                        <span aria-label="Seu avatar">{avatar.valor}</span>
                    ) : (
                        <FiUser size={52} className="text-brand-200" aria-label="Sem foto de perfil" />
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    aria-label="Alterar foto de perfil"
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-brand-950 shadow-md transition-colors hover:bg-gold-400"
                >
                    <FiPlus size={20} />
                </button>
            </div>

            <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)}>
                <h2 className="text-lg font-bold text-brand-900">Escolha seu avatar</h2>

                <div className="mt-4 grid grid-cols-4 gap-2">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => escolherEmoji(emoji)}
                            className="rounded-lg border border-gray-200 py-2 text-3xl transition-colors hover:border-brand-500 hover:bg-brand-50"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <p className="mt-5 text-sm font-semibold text-brand-900">Ou envie uma imagem</p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={escolherImagem}
                    className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800"
                />
                <p className="mt-1 text-xs text-gray-500">Até {TAMANHO_MAXIMO_KB} KB. Fica salva só neste navegador.</p>

                {erro && (
                    <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        {erro}
                    </p>
                )}

                {avatar && (
                    <Button variant="secondary" className="mt-4" onClick={remover}>
                        Remover foto
                    </Button>
                )}
            </Modal>
        </>
    );
}
