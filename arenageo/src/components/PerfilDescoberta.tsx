"use client";
import { useRef, useState } from "react";
import { salvarDescoberta } from "@/services/servicoDescoberta";
import type { DiscoveryConfig } from "@/types/jogador";
const days = [
  "",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const minute = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
};
export function PerfilDescoberta({ initial }: { initial: DiscoveryConfig }) {
  const [data, setData] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await salvarDescoberta(data);
      if (r.ok) {
        setData(r.value);
        setMessage("Descoberta atualizada.");
      } else setMessage(r.message);
    } catch {
      setMessage(
        "Não foi possível confirmar. Atualize a página antes de reenviar.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <fieldset disabled={busy}>
        <legend>Perfil público e disponibilidade</legend>
        <p>
          Somente os dados abaixo, seu nome de usuário e seus esportes/níveis
          serão publicados. Não escreva endereço residencial, telefone ou
          documentos na apresentação. A localização pública é a cidade escolhida
          aqui.
        </p>
        <label>
          <input
            type="checkbox"
            checked={data.visible}
            onChange={(e) => setData({ ...data, visible: e.target.checked })}
          />{" "}
          Quero aparecer na busca de jogadores
        </label>
        <label className="field">
          Nome público
          <input
            required
            maxLength={80}
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </label>
        <label className="field">
          Cidade pública
          <input
            required
            maxLength={120}
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
          />
        </label>
        <label className="field">
          UF pública
          <select
            value={data.state}
            onChange={(e) => setData({ ...data, state: e.target.value })}
          >
            {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
              .split(" ")
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </select>
        </label>
        <label className="field">
          Apresentação pública
          <textarea
            maxLength={500}
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
          />
        </label>
        <label className="field">
          Fuso dos horários
          <select
            value={data.timezone}
            onChange={(e) => setData({ ...data, timezone: e.target.value })}
          >
            {[
              "America/Sao_Paulo",
              "America/Manaus",
              "America/Cuiaba",
              "America/Rio_Branco",
              "America/Noronha",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Disponível até
          <input
            required
            type="date"
            value={data.validUntil}
            onChange={(e) => setData({ ...data, validUntil: e.target.value })}
          />
        </label>
        <p>
          A publicação vence nesta data, no fuso escolhido. Validade máxima de
          90 dias. Desmarque a descoberta para pausar imediatamente após salvar.
        </p>
        {data.slots.map((s, i) => (
          <fieldset key={i}>
            <legend>Horário {i + 1}</legend>
            <label>
              Dia
              <select
                aria-label={`Dia ${i + 1}`}
                value={s.day}
                onChange={(e) =>
                  setData({
                    ...data,
                    slots: data.slots.map((x, n) =>
                      n === i ? { ...x, day: Number(e.target.value) } : x,
                    ),
                  })
                }
              >
                {days.slice(1).map((d, n) => (
                  <option key={d} value={n + 1}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Início
              <input
                aria-label={`Início ${i + 1}`}
                required
                type="time"
                value={time(s.start)}
                onChange={(e) =>
                  setData({
                    ...data,
                    slots: data.slots.map((x, n) =>
                      n === i ? { ...x, start: minute(e.target.value) } : x,
                    ),
                  })
                }
              />
            </label>
            <label>
              Fim
              <input
                aria-label={`Fim ${i + 1}`}
                required
                type="time"
                disabled={s.end === 1440}
                value={time(s.end === 1440 ? 0 : s.end)}
                onChange={(e) =>
                  setData({
                    ...data,
                    slots: data.slots.map((x, n) =>
                      n === i ? { ...x, end: minute(e.target.value) } : x,
                    ),
                  })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={s.end === 1440}
                onChange={(e) =>
                  setData({
                    ...data,
                    slots: data.slots.map((x, n) =>
                      n === i
                        ? { ...x, end: e.target.checked ? 1440 : 1320 }
                        : x,
                    ),
                  })
                }
              />{" "}
              Termina à meia-noite
            </label>
            <button
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  slots: data.slots.filter((_, n) => n !== i),
                })
              }
            >
              Remover horário {i + 1}
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          disabled={data.slots.length >= 28}
          onClick={() =>
            setData({
              ...data,
              slots: [...data.slots, { day: 1, start: 1080, end: 1320 }],
            })
          }
        >
          Adicionar horário
        </button>
        <p>
          Um intervalo por dia/período, sem sobreposição. Para atravessar a
          meia-noite, use dois dias.
        </p>
        <button>Salvar descoberta</button>
      </fieldset>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
