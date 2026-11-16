"use client";
import { useEffect, useRef, useState } from "react";
import {
  compartilharQuadro,
  revogarCompartilhamento,
  estadoCompartilhamento,
} from "@/services/servicoQuadro";

export function CompartilharQuadro({
  id,
  revision,
  disabled,
}: {
  id: string;
  revision: number;
  disabled: boolean;
}) {
  const [names, setNames] = useState(false);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("Consultando compartilhamento…");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const operation = useRef(0);
  useEffect(() => {
    let alive = true;
    const version = operation.current;
    void estadoCompartilhamento(id)
      .then((r) => {
        if (!alive || version !== operation.current) return;
        setMessage(
          r.ok
            ? r.data.active
              ? `Link ativo até ${new Date(r.data.share!.expires).toLocaleString("pt-BR")}. Você pode revogá-lo ou gerar outro.`
              : "Nenhum link ativo."
            : r.message,
        );
      })
      .catch(() => {
        if (alive && version === operation.current)
          setMessage("Não foi possível consultar o link. Atualize a página.");
      });
    return () => {
      alive = false;
    };
  }, [id]);
  async function run(revoke: boolean) {
    if (lock.current) return;
    lock.current = true;
    operation.current++;
    setBusy(true);
    try {
      if (revoke) {
        const r = await revogarCompartilhamento(id);
        if (r.ok) {
          setLink("");
          setMessage("Link revogado. Novas aberturas não terão acesso.");
        } else setMessage(r.message);
      } else {
        const r = await compartilharQuadro(id, revision, names);
        if (r.ok) {
          setLink(
            `${window.location.origin}/quadro-compartilhado/${r.data.token}`,
          );
          setMessage(
            `Link de leitura criado. Válido até ${new Date(r.data.expires).toLocaleString("pt-BR")}.`,
          );
        } else {
          setLink("");
          setMessage(
            r.unknown
              ? "Não foi possível confirmar a criação. Gere outro link para invalidar qualquer tentativa anterior."
              : r.message,
          );
        }
      }
    } catch {
      setLink("");
      setMessage(
        "Não foi possível confirmar a operação. Tente novamente; gerar outro link invalida o anterior.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section aria-label="Compartilhamento do quadro">
      <h3>Compartilhar versão salva</h3>
      <p>
        Qualquer pessoa com o link poderá ver o título e esta versão do quadro
        durante sete dias, sem editar. Gerar outro link invalida o anterior.
        Confira se o título contém informações que deseja divulgar.
      </p>
      <label>
        <input
          type="checkbox"
          checked={names}
          onChange={(e) => setNames(e.target.checked)}
        />{" "}
        Incluir nomes dos jogadores no link
      </label>
      <div>
        <button disabled={busy || disabled} onClick={() => void run(false)}>
          Gerar link de leitura
        </button>{" "}
        <button disabled={busy} onClick={() => void run(true)}>
          Revogar link de leitura
        </button>
      </div>
      {disabled && (
        <p>Salve ou abra a versão atual da conta antes de gerar o link.</p>
      )}
      {link && (
        <label className="field">
          Link de leitura
          <input readOnly value={link} onFocus={(e) => e.target.select()} />
        </label>
      )}
      <p role="status">{message}</p>
      <small>
        Revogar impede novas consultas; não apaga cópias ou imagens já guardadas
        por quem recebeu.
      </small>
    </section>
  );
}
