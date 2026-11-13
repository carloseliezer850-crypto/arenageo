"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { criarPartida } from "@/services/servicoPartida";
import { useToast } from "./ToastProvider";
import type { NovaPartida } from "@/types/partidaPlataforma";
import type { Sport } from "@/types/esporte";
import type { SkillLevel } from "@/types/nivelHabilidade";

export function FormularioCriarPartida({
  sports,
  levels,
}: {
  sports: Sport[];
  levels: SkillLevel[];
}) {
  const router = useRouter(),
    toast = useToast();
  const [body, setBody] = useState<NovaPartida>({
    title: "",
    description: "",
    sportId: 0,
    skillLevelId: 0,
    location: "",
    city: "",
    state: "RS",
    dateTime: "",
    timezone: "America/Sao_Paulo",
    durationMinutes: 90,
    maxPlayers: 10,
    participate: true,
    publish: true,
  });
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const key = useRef<string>(""),
    locked = useRef(false),
    previous = useRef("");
  const [unknown, setUnknown] = useState(false);
  function update<K extends keyof NovaPartida>(name: K, value: NovaPartida[K]) {
    setBody((v) => ({ ...v, [name]: value }));
  }
  const field = (
    name: keyof NovaPartida,
    label: string,
    type = "text",
    min?: number,
    max?: number,
  ) => (
    <label className="field" key={name}>
      {label}
      <input
        name={name}
        type={type}
        value={String(body[name])}
        required
        min={min}
        max={max}
        maxLength={name === "title" ? 120 : name === "location" ? 200 : 120}
        onChange={(e) =>
          update(
            name,
            (type === "number"
              ? Number(e.target.value)
              : e.target.value) as never,
          )
        }
        aria-invalid={Boolean(errors[name])}
      />
      {errors[name] && <small role="alert">{errors[name]}</small>}
    </label>
  );
  return (
    <form
      className="form-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        if (locked.current) return;
        locked.current = true;
        setBusy(true);
        const payload = JSON.stringify(body);
        if (previous.current !== payload && !unknown) {
          key.current = crypto.randomUUID();
          previous.current = payload;
        }
        try {
          const r = await criarPartida(body, key.current);
          setErrors(r.fields);
          setMessage(r.message);
          toast(r.message);
          if (r.success) {
            router.push(`/partidas/${r.data.id}`);
            router.refresh();
          } else {
            setUnknown(r.code === "RESULT_UNKNOWN");
            const name = Object.keys(r.fields)[0];
            if (name)
              (
                formElement.elements.namedItem(name) as HTMLElement | null
              )?.focus();
          }
        } finally {
          locked.current = false;
          setBusy(false);
        }
      }}
    >
      <p>
        Partida gratuita em local informado. Criar ou publicar não reserva uma
        quadra.
      </p>
      <fieldset disabled={busy || unknown} style={{ border: 0, padding: 0 }}>
        <div className="form-grid two-columns">
          {field("title", "Nome da partida")}
          <label className="field">
            Esporte
            <select
              name="sportId"
              required
              value={body.sportId || ""}
              onChange={(e) => update("sportId", Number(e.target.value))}
            >
              <option value="">Selecione</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <small>{errors.sportId}</small>
          </label>
          <label className="field">
            Nível
            <select
              name="skillLevelId"
              required
              value={body.skillLevelId || ""}
              onChange={(e) => update("skillLevelId", Number(e.target.value))}
            >
              <option value="">Selecione</option>
              {levels.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <small>{errors.skillLevelId}</small>
          </label>
          {field("dateTime", "Data e horário", "datetime-local")}
          <label className="field">
            Fuso
            <select
              name="timezone"
              value={body.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              {[
                "America/Sao_Paulo",
                "America/Manaus",
                "America/Rio_Branco",
                "America/Noronha",
              ].map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
            <small>{errors.timezone}</small>
          </label>
          {field("durationMinutes", "Duração em minutos", "number", 15, 480)}
          {field("maxPlayers", "Total de participantes", "number", 2, 100)}
          {field("city", "Cidade")}
          <label className="field">
            UF
            <select
              name="state"
              value={body.state}
              onChange={(e) => update("state", e.target.value)}
            >
              {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                .split(" ")
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </label>
          {field("location", "Nome e endereço do local combinado")}
          <label className="field">
            Descrição e regras
            <textarea
              name="description"
              required
              maxLength={3000}
              value={body.description}
              onChange={(e) => update("description", e.target.value)}
            />
            <small>{errors.description}</small>
          </label>
        </div>
        <label>
          <input
            type="checkbox"
            checked={body.participate}
            onChange={(e) => update("participate", e.target.checked)}
          />{" "}
          Também vou jogar (ocupa uma vaga)
        </label>
        <label className="field">
          Salvar como
          <select
            value={String(body.publish)}
            onChange={(e) => update("publish", e.target.value === "true")}
          >
            <option value="true">Partida pública</option>
            <option value="false">Rascunho privado</option>
          </select>
        </label>
        <p>
          Revise local, fuso e capacidade. Os detalhes públicos ficam visíveis a
          visitantes após publicar.
        </p>
      </fieldset>
      {message && <p role="status">{message}</p>}
      {unknown && (
        <p>
          Os dados foram preservados para repetir o mesmo envio sem criar outra
          partida.{" "}
          <Link href="/minhas-partidas">Consultar minhas partidas</Link>
        </p>
      )}
      <div className="action-row">
        <Link href="/partidas">Voltar</Link>
        <button disabled={busy} className="primary-button">
          {busy
            ? "Salvando…"
            : unknown
              ? "Verificar e repetir envio"
              : body.publish
                ? "Publicar partida"
                : "Salvar rascunho"}
        </button>
      </div>
    </form>
  );
}
