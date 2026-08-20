"use client";

import { useState } from "react";
import type { CreateMatchRequest } from "@/types/auth";
import { createMatch } from "@/services/matchService";

const initialState: CreateMatchRequest = {
  creatorId: 1,
  sportId: 1,
  spaceId: null,
  title: "Futebol de quarta-feira",
  description: "Partida aberta para completar o time e jogar em um ambiente descontraído.",
  dateTime: "2026-08-20T19:30",
  durationMinutes: 90,
  maxPlayers: 10,
  skillLevelId: 2,
  city: "Bagé",
  visibility: "public",
};

const sportMap: Record<number, string> = {
  1: "Futebol",
  2: "Futsal",
  3: "Beach Tennis",
};

export function CreateMatchForm() {
  const [form, setForm] = useState<CreateMatchRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) nextErrors.title = "Título obrigatório.";
    if (!form.dateTime) nextErrors.dateTime = "Data e horário são obrigatórios.";
    if (!form.city.trim()) nextErrors.city = "Cidade obrigatória.";
    if (form.maxPlayers <= 0) nextErrors.maxPlayers = "Quantidade de jogadores deve ser maior que zero.";
    if (!form.skillLevelId) nextErrors.skillLevelId = "Nível é obrigatório.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setSubmitMessage("Corrija os campos obrigatórios antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    const result = await createMatch(form);
    setSubmitMessage(result.message);
    setIsSubmitting(false);
  };

  const updateForm = <K extends keyof CreateMatchRequest>(field: K, value: CreateMatchRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const dateLabel = form.dateTime ? new Date(form.dateTime).toLocaleDateString("pt-BR") : "Data ainda não definida";
  const timeLabel = form.dateTime ? new Date(form.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Horário não definido";

  return (
    <form className="form-card create-form-card" onSubmit={handleSubmit} noValidate>
      <div className="create-match-layout">
        <div className="form-sections-stack">
          <div className="form-section">
            <h3 className="section-title">Informações da partida</h3>
            <div className="form-grid two-columns">
              <label className="field full-width">
                <span>Nome da partida</span>
                <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
                {errors.title ? <small>{errors.title}</small> : null}
              </label>

              <label className="field">
                <span>Esporte</span>
                <select value={form.sportId} onChange={(event) => updateForm("sportId", Number(event.target.value))}>
                  <option value={1}>Futebol</option>
                  <option value={2}>Futsal</option>
                  <option value={3}>Beach Tennis</option>
                </select>
              </label>

              <label className="field full-width">
                <span>Descrição</span>
                <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Quando vai acontecer?</h3>
            <div className="form-grid three-columns">
              <label className="field">
                <span>Data</span>
                <input type="date" value={form.dateTime ? form.dateTime.slice(0, 10) : ""} onChange={(event) => {
                  const nextDate = event.target.value;
                  const currentTime = form.dateTime ? form.dateTime.slice(11, 16) : "19:30";
                  updateForm("dateTime", nextDate ? `${nextDate}T${currentTime}` : "");
                }} />
                {errors.dateTime ? <small>{errors.dateTime}</small> : null}
              </label>

              <label className="field">
                <span>Horário</span>
                <input type="time" value={form.dateTime ? form.dateTime.slice(11, 16) : "19:30"} onChange={(event) => {
                  const currentDate = form.dateTime ? form.dateTime.slice(0, 10) : "2026-08-20";
                  updateForm("dateTime", currentDate ? `${currentDate}T${event.target.value}` : "");
                }} />
              </label>

              <label className="field">
                <span>Duração</span>
                <input type="number" value={form.durationMinutes} onChange={(event) => updateForm("durationMinutes", Number(event.target.value))} />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Configuração da partida</h3>
            <div className="form-grid three-columns">
              <label className="field">
                <span>Número de jogadores</span>
                <input type="number" value={form.maxPlayers} onChange={(event) => updateForm("maxPlayers", Number(event.target.value))} />
                {errors.maxPlayers ? <small>{errors.maxPlayers}</small> : null}
              </label>

              <label className="field">
                <span>Nível</span>
                <select value={form.skillLevelId} onChange={(event) => updateForm("skillLevelId", Number(event.target.value))}>
                  <option value={1}>Iniciante</option>
                  <option value={2}>Intermediário</option>
                  <option value={3}>Avançado</option>
                </select>
                {errors.skillLevelId ? <small>{errors.skillLevelId}</small> : null}
              </label>

              <div className="field radio-field">
                <span>Visibilidade</span>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="visibility" checked={form.visibility === "public"} onChange={() => updateForm("visibility", "public")} />
                    Pública
                  </label>
                  <label>
                    <input type="radio" name="visibility" checked={form.visibility === "private"} onChange={() => updateForm("visibility", "private")} />
                    Privada
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Onde será a partida?</h3>
            <div className="form-grid two-columns">
              <label className="field">
                <span>Cidade</span>
                <input value={form.city} onChange={(event) => updateForm("city", event.target.value)} />
                {errors.city ? <small>{errors.city}</small> : null}
              </label>

              <label className="field">
                <span>Arena</span>
                <input placeholder="Arena Sul" />
              </label>

              <label className="field full-width">
                <span>Espaço / quadra</span>
                <input placeholder="Quadra 2" />
              </label>
            </div>
            <p className="form-help">Você poderá escolher o espaço depois.</p>
          </div>
        </div>

        <aside className="summary-card">
          <h3>Resumo</h3>
          <div className="summary-body">
            <strong>{form.title || "Sua partida"}</strong>
            <p>{sportMap[form.sportId] || "Esporte"}</p>
            <ul>
              <li>{dateLabel}</li>
              <li>{timeLabel}</li>
              <li>{form.maxPlayers} jogadores</li>
              <li>{form.skillLevelId === 1 ? "Iniciante" : form.skillLevelId === 2 ? "Intermediário" : "Avançado"}</li>
            </ul>
            <span className="summary-local">{form.city || "Local ainda não definido"}</span>
          </div>
        </aside>
      </div>

      <div className="action-row">
        <button type="button" className="secondary-button">Cancelar</button>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Criando partida..." : "Criar partida"}
        </button>
      </div>

      {submitMessage ? <p className="success-message">{submitMessage}</p> : null}
    </form>
  );
}
