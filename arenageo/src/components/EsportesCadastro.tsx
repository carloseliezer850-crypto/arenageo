"use client";
import { useEffect, useState } from "react";
import { catalogosCadastro } from "@/services/servicoCatalogosCadastro";
import type { RegisterPlayerRequest } from "@/types/autenticacao";
import type { Erros } from "@/lib/cadastro";
export function EsportesCadastro({
  value,
  onChange,
  errors,
  onReady,
}: {
  value: RegisterPlayerRequest["sports"];
  onChange: (v: RegisterPlayerRequest["sports"]) => void;
  errors: Erros;
  onReady: (v: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<Awaited<
    ReturnType<typeof catalogosCadastro>
  > | null>(null);
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    catalogosCadastro().then((c) => {
      if (active) {
        setCatalog(c);
        onReady(!c.error && c.sports.length > 0 && c.levels.length > 0);
      }
    });
    return () => {
      active = false;
    };
  }, [retry, onReady]);
  if (!catalog) return <p role="status">Carregando esportes e níveis…</p>;
  if (catalog.error || !catalog.sports.length || !catalog.levels.length)
    return (
      <div role="alert">
        <p>
          {catalog.error ||
            "O catálogo de esportes ou níveis está vazio. Não é possível concluir o cadastro agora."}
        </p>
        <button
          type="button"
          onClick={() => {
            setCatalog(null);
            onReady(false);
            setRetry((n) => n + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  return (
    <fieldset id="sports" tabIndex={-1}>
      <legend>Selecione seus esportes *</legend>
      <label className="field">
        Buscar no catálogo
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome do esporte"
        />
      </label>
      {catalog.sports
        .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
        .map((s) => {
          const index = value.findIndex((v) => v.sportId === s.id);
          const selected = value[index];
          return (
            <div key={s.id} className="sport-row">
              <label>
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...value, { sportId: s.id, skillLevelId: 0 }]
                        : value.filter((v) => v.sportId !== s.id),
                    )
                  }
                />
                {s.name}
              </label>
              {selected && (
                <label className="field">
                  Nível em {s.name} *
                  <select
                    name={`sports[${index}].skillLevelId`}
                    id={`sports[${index}].skillLevelId`}
                    value={selected.skillLevelId}
                    aria-invalid={!!errors[`sports[${index}].skillLevelId`]}
                    aria-describedby={`nivel-${s.id}-erro`}
                    onChange={(e) =>
                      onChange(
                        value.map((v) =>
                          v.sportId === s.id
                            ? { ...v, skillLevelId: Number(e.target.value) }
                            : v,
                        ),
                      )
                    }
                  >
                    <option value={0}>Selecione seu nível</option>
                    {catalog.levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <small id={`nivel-${s.id}-erro`}>
                    {errors[`sports[${index}].skillLevelId`] ||
                      errors[`sports[${index}].sportId`]}
                  </small>
                </label>
              )}
            </div>
          );
        })}
      <p className="field-error">{errors.sports}</p>
    </fieldset>
  );
}
