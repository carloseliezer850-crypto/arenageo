/* eslint-disable @next/next/no-img-element -- Private authenticated media must not be cached by the image optimizer. */
"use client";
import { useEffect, useState } from "react";
import {
  listarMidias,
  enviarMidia,
  excluirMidia,
  ordenarMidias,
} from "@/services/servicoMidia";
import { useToast } from "./ToastProvider";
export function Galeria({ arena }: { arena?: number }) {
  const [images, setImages] = useState<{ id: string; position: number }[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const toast = useToast();
  useEffect(() => {
    let active = true;
    listarMidias(arena)
      .then((v) => {
        if (active) setImages(v);
      })
      .catch(() => {
        if (active) setMessage("Não foi possível carregar as imagens.");
      });
    return () => {
      active = false;
    };
  }, [arena]);
  return (
    <section className="form-card">
      <h2>{arena ? "Capa e galeria" : "Foto de perfil"}</h2>
      <p>
        JPG, PNG ou WebP, até 5 MB e 20 megapixels.{" "}
        {arena ? "Até 10 imagens; a primeira é a capa." : ""}
      </p>
      <label className="field">
        Enviar imagem
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 5 * 1024 * 1024) {
              setMessage("A imagem deve ter até 5 MB.");
              e.target.value = "";
              return;
            }
            const fd = new FormData();
            fd.set("file", f);
            if (arena) fd.set("arena", String(arena));
            setBusy(true);
            try {
              const r = await enviarMidia(fd);
              setMessage(r.message);
              toast(r.message);
              if (r.success) setImages(await listarMidias(arena));
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <div className="form-grid two-columns">
        {images.map((im, i) => (
          <figure key={im.id}>
            {/* Private authenticated media route; optimization would cache private data. */}
            <img
              src={"/api/midias/" + im.id}
              alt={arena ? "Imagem " + (i + 1) + " da arena" : "Minha foto"}
              style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain" }}
            />
            <figcaption>{arena && i === 0 ? "Capa" : ""}</figcaption>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await excluirMidia(im.id);
                  setImages(await listarMidias(arena));
                } catch {
                  setMessage("Não foi possível remover a imagem.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Excluir
            </button>
            {arena && i > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await ordenarMidias(arena, [
                      im.id,
                      ...images.filter((v) => v.id !== im.id).map((v) => v.id),
                    ]);
                    setImages(await listarMidias(arena));
                  } catch {
                    setMessage("Não foi possível reordenar.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Usar como capa
              </button>
            )}
          </figure>
        ))}
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
