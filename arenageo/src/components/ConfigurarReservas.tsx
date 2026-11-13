"use client";
import { useRef, useState } from "react";
import { salvarConfigReserva, bloquearEspaco } from "@/services/servicoReserva";
import type { ReservaConfig } from "@/types/reserva";
export function ConfigurarReservas({
  id,
  initial,
}: {
  id: number;
  initial: ReservaConfig;
}) {
  const [config, setConfig] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [price, setPrice] = useState(
    (initial.hourlyCents / 100).toFixed(2).replace(".", ","),
  );
  const lock = useRef(false);
  return (
    <form
      className="form-card"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        try {
          const [reais, centavos = ""] = price.replace(",", ".").split(".");
          const hourlyCents =
            Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
          const r = await salvarConfigReserva(id, { ...config, hourlyCents });
          if (r.ok) {
            setConfig(r.data);
            setMessage("Configuração salva.");
          } else setMessage(r.message);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <legend>Reservas com pagamento no local</legend>
        <label>
          <input
            type="checkbox"
            checked={config.online}
            onChange={(e) => setConfig({ ...config, online: e.target.checked })}
          />{" "}
          Ativar reservas online confirmadas automaticamente
        </label>
        <p>
          O cliente reserva a quadra inteira e paga à arena. Nenhuma cobrança
          online é feita.
        </p>
        <label className="field">
          Preço por hora (R$)
          <input
            required
            inputMode="decimal"
            pattern="[0-9]{1,6}([.,][0-9]{1,2})?"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        {(
          [
            ["durationMinutes", "Duração da reserva em minutos", 30, 240, 15],
            [
              "preparationMinutes",
              "Preparação após a reserva em minutos",
              0,
              120,
              1,
            ],
            [
              "cancellationHours",
              "Antecedência para cancelamento online em horas",
              0,
              720,
              1,
            ],
          ] as const
        ).map(([field, label, min, max, step]) => (
          <label key={field} className="field">
            {label}
            <input
              type="number"
              required
              min={min}
              max={max}
              step={step}
              value={config[field]}
              onChange={(e) =>
                setConfig({ ...config, [field]: Number(e.target.value) })
              }
            />
          </label>
        ))}
        <label className="field">
          Condições da reserva
          <textarea
            required
            minLength={10}
            maxLength={1000}
            value={config.policy}
            onChange={(e) => setConfig({ ...config, policy: e.target.value })}
          />
        </label>
        <p>
          Alterações valem para novos orçamentos. Reservas confirmadas preservam
          o preço e as condições aceitas.
        </p>
        <button className="primary-button">Salvar configuração</button>
      </fieldset>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
export function BloquearEspaco({
  spaces,
}: {
  spaces: { id?: number; name: string }[];
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const key = useRef(""),
    payload = useRef(""),
    lock = useRef(false);
  const [unknown, setUnknown] = useState(false);
  return (
    <form
      className="form-card"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        const form = new FormData(e.currentTarget);
        const body = unknown
          ? (JSON.parse(payload.current) as {
              spaceId: number;
              start: string;
              end: string;
              reason: string;
            })
          : {
              spaceId: Number(form.get("spaceId")),
              start: String(form.get("start")),
              end: String(form.get("end")),
              reason: String(form.get("reason")),
            };
        const next = JSON.stringify(body);
        if (!unknown && payload.current !== next) {
          key.current = crypto.randomUUID();
          payload.current = next;
        }
        lock.current = true;
        setBusy(true);
        try {
          const r = await bloquearEspaco(body, key.current);
          if (r.ok) {
            setMessage("Bloqueio criado. Atualize a agenda para consultá-lo.");
            setUnknown(false);
          } else {
            setMessage(r.message);
            setUnknown(r.unknown);
          }
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <h2>Bloquear horário</h2>
      <p>
        Manutenção e indisponibilidade. Horários no fuso da arena; reservas
        existentes impedem o bloqueio.
      </p>
      <label className="field">
        Espaço
        <select name="spaceId" required disabled={busy || unknown}>
          {spaces.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Início
        <input
          type="datetime-local"
          name="start"
          required
          readOnly={unknown}
          disabled={busy}
        />
      </label>
      <label className="field">
        Fim
        <input
          type="datetime-local"
          name="end"
          required
          readOnly={unknown}
          disabled={busy}
        />
      </label>
      <label className="field">
        Motivo
        <input
          name="reason"
          minLength={5}
          maxLength={500}
          required
          readOnly={unknown}
          disabled={busy}
        />
      </label>
      <button disabled={busy || !spaces.length}>
        {unknown ? "Consultar novamente este envio" : "Criar bloqueio"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
