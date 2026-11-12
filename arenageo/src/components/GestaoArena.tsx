"use client";
import { useState, useRef } from "react";
import {
  salvarArena,
  type GestaoArena as Dados,
} from "@/services/servicoGestao";
import { Campo, EnderecoCampos, focarErro } from "./CamposCadastro";
import type { Sport } from "@/types/esporte";
import type { Erros } from "@/lib/cadastro";
import { useToast } from "./ToastProvider";
const tempo = (n: number) =>
  String(Math.floor((n % 1440) / 60)).padStart(2, "0") +
  ":" +
  String(n % 60).padStart(2, "0");
const minutos = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const dias = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
export function GestaoArena({
  id,
  initial,
  sports,
}: {
  id: number;
  initial: Dados;
  sports: Sport[];
}) {
  const [v, setV] = useState(initial),
    [errors, setErrors] = useState<Erros>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false),
    toast = useToast();
  const space = (i: number, patch: Partial<Dados["spaces"][number]>) =>
    setV({
      ...v,
      spaces: v.spaces.map((s, n) => (n === i ? { ...s, ...patch } : s)),
    });
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        try {
          const r = await salvarArena(id, v);
          setErrors(r.fields);
          setMessage(r.message);
          toast(r.message);
          if (r.success && r.data) setV(r.data);
          else focarErro(r.fields);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <h2>Dados da arena</h2>
      <div className="form-grid two-columns">
        {(
          [
            "name",
            "phone",
            "email",
            "website",
            "instagram",
            "openingHours",
          ] as const
        ).map((k, i) => (
          <Campo
            key={k}
            name={"arena." + k}
            label={
              [
                "Nome",
                "Telefone",
                "E-mail",
                "Website",
                "Instagram",
                "Resumo do funcionamento",
              ][i]
            }
            required={i < 3}
            value={v.arena[k] ?? ""}
            error={errors["arena." + k]}
            onChange={(e) =>
              setV({ ...v, arena: { ...v.arena, [k]: e.target.value } })
            }
          />
        ))}
      </div>
      <label className="field">
        Descrição
        <textarea
          value={v.arena.description ?? ""}
          onChange={(e) =>
            setV({ ...v, arena: { ...v.arena, description: e.target.value } })
          }
        />
      </label>
      <EnderecoCampos
        onFill={(patch) =>
          setV((prev) => ({ ...prev, address: { ...prev.address, ...patch } }))
        }
        comercial
        value={{
          ...v.address,
          zipCode: v.address.zipCode ?? "",
          neighborhood: v.address.neighborhood ?? "",
        }}
        errors={errors}
        onChange={(key, value) =>
          setV({ ...v, address: { ...v.address, [key]: value } })
        }
      />
      <div className="form-grid two-columns">
        {(["latitude", "longitude"] as const).map((k) => (
          <Campo
            key={k}
            label={k === "latitude" ? "Latitude" : "Longitude"}
            name={"address." + k}
            type="number"
            step="any"
            value={v.address[k] ?? ""}
            error={errors["address." + k]}
            onChange={(e) =>
              setV({
                ...v,
                address: {
                  ...v.address,
                  [k]: e.target.value === "" ? null : Number(e.target.value),
                },
              })
            }
          />
        ))}
      </div>
      <h2 id="spaces" tabIndex={-1}>
        Espaços e modalidades
      </h2>
      <p>{errors.spaces}</p>
      {v.spaces.map((s, i) => (
        <fieldset key={i}>
          <legend>Espaço {i + 1}</legend>
          <Campo
            name={`spaces[${i}].name`}
            label="Nome"
            required
            value={s.name}
            error={errors[`spaces[${i}].name`]}
            onChange={(e) => space(i, { name: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={s.covered}
              onChange={(e) => space(i, { covered: e.target.checked })}
            />{" "}
            Coberto
          </label>
          <Campo
            label="Piso"
            name={`spaces[${i}].floor`}
            value={s.floor ?? ""}
            onChange={(e) => space(i, { floor: e.target.value })}
          />
          {(["capacity", "width", "length"] as const).map((k, n) => (
            <Campo
              key={k}
              label={["Capacidade", "Largura (m)", "Comprimento (m)"][n]}
              name={`spaces[${i}].${k}`}
              type="number"
              min={0.1}
              step="any"
              value={s[k] ?? ""}
              error={errors[`spaces[${i}].${k}`]}
              onChange={(e) =>
                space(i, {
                  [k]: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          ))}
          <p>Modalidades *</p>
          {sports.map((sport) => (
            <label key={sport.id}>
              <input
                type="checkbox"
                checked={s.sportIds.includes(sport.id)}
                onChange={(e) =>
                  space(i, {
                    sportIds: e.target.checked
                      ? [...s.sportIds, sport.id]
                      : s.sportIds.filter((id) => id !== sport.id),
                  })
                }
              />
              {sport.name}{" "}
            </label>
          ))}
          <p>{errors[`spaces[${i}].sportIds`]}</p>
          <button
            type="button"
            onClick={() =>
              setV({ ...v, spaces: v.spaces.filter((_, n) => n !== i) })
            }
          >
            Remover espaço
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() =>
          setV({
            ...v,
            spaces: [
              ...v.spaces,
              {
                name: "",
                sportIds: [],
                covered: false,
                floor: "",
                capacity: null,
                width: null,
                length: null,
              },
            ],
          })
        }
      >
        Adicionar espaço
      </button>
      <h2 id="hours" tabIndex={-1}>
        Funcionamento semanal
      </h2>
      <p>
        Dia sem períodos = fechado. Marque “Termina no dia seguinte” para
        funcionamento após a meia-noite.
      </p>
      <Campo
        label="Fuso horário"
        name="timezone"
        required
        value={v.timezone}
        error={errors.timezone}
        onChange={(e) => setV({ ...v, timezone: e.target.value })}
      />
      {v.hours.map((h, i) => (
        <div className="form-grid" key={i}>
          <select
            aria-label="Dia"
            value={h.day}
            onChange={(e) =>
              setV({
                ...v,
                hours: v.hours.map((p, n) =>
                  n === i ? { ...p, day: Number(e.target.value) } : p,
                ),
              })
            }
          >
            {dias.map((d, n) => (
              <option key={d} value={n}>
                {d}
              </option>
            ))}
          </select>
          {(["start", "end"] as const).map((k) => (
            <Campo
              key={k}
              label={k === "start" ? "Abre às" : "Fecha às"}
              name={`hours[${i}].${k}`}
              required
              type="time"
              value={tempo(h[k])}
              onChange={(e) =>
                setV({
                  ...v,
                  hours: v.hours.map((p, n) =>
                    n === i
                      ? {
                          ...p,
                          [k]:
                            minutos(e.target.value) +
                            (k === "end" && p.end >= 1440 ? 1440 : 0),
                        }
                      : p,
                  ),
                })
              }
            />
          ))}
          <label>
            <input
              type="checkbox"
              checked={h.end >= 1440}
              onChange={(e) =>
                setV({
                  ...v,
                  hours: v.hours.map((p, n) =>
                    n === i
                      ? {
                          ...p,
                          end: (p.end % 1440) + (e.target.checked ? 1440 : 0),
                        }
                      : p,
                  ),
                })
              }
            />
            Termina no dia seguinte
          </label>
          <button
            type="button"
            onClick={() =>
              setV({ ...v, hours: v.hours.filter((_, n) => n !== i) })
            }
          >
            Remover período
          </button>
        </div>
      ))}
      <p role="alert">{errors.hours}</p>
      <button
        type="button"
        onClick={() =>
          setV({ ...v, hours: [...v.hours, { day: 1, start: 480, end: 1080 }] })
        }
      >
        Adicionar período
      </button>
      <h2 id="exceptions" tabIndex={-1}>
        Exceções por data
      </h2>
      <p>
        Adicione feriados fechados. O funcionamento semanal continua nos demais
        dias.
      </p>
      {v.exceptions.map((x, i) => (
        <div key={i}>
          <Campo
            label="Data fechada"
            name={`exceptions[${i}].date`}
            type="date"
            required
            value={x.date}
            onChange={(e) =>
              setV({
                ...v,
                exceptions: v.exceptions.map((p, n) =>
                  n === i ? { ...p, date: e.target.value } : p,
                ),
              })
            }
          />
          {x.periods.length > 0 && (
            <p>
              Esta data possui {x.periods.length} períodos especiais
              cadastrados.
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              setV({ ...v, exceptions: v.exceptions.filter((_, n) => n !== i) })
            }
          >
            Remover exceção
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setV({
            ...v,
            exceptions: [...v.exceptions, { date: "", periods: [] }],
          })
        }
      >
        Adicionar data fechada
      </button>
      <p>{errors.exceptions}</p>
      <label>
        <input
          id="publish"
          type="checkbox"
          checked={v.publish}
          onChange={(e) => setV({ ...v, publish: e.target.checked })}
        />{" "}
        Publicar na busca de arenas
      </label>
      <p>{errors.publish}</p>
      {message && <p role="status">{message}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Salvando…" : "Salvar arena"}
      </button>
    </form>
  );
}
