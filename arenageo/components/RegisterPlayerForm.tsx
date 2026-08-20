"use client";

import { useState } from "react";
import { registerPlayer } from "@/services/authService";
import type { RegisterPlayerRequest } from "@/types/auth";

const initialState: RegisterPlayerRequest = {
  user: {
    name: "",
    username: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    password: "",
  },
  address: {
    zipCode: "",
    state: "",
    city: "",
    neighborhood: "",
    latitude: null,
    longitude: null,
  },
  sports: [
    { sportId: 1, skillLevelId: 2 },
    { sportId: 3, skillLevelId: 1 },
  ],
};

export function RegisterPlayerForm() {
  const [form, setForm] = useState<RegisterPlayerRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.user.name.trim()) nextErrors.name = "Nome obrigatório.";
    if (!form.user.email.trim()) nextErrors.email = "E-mail obrigatório.";
    if (!form.user.password) nextErrors.password = "Senha obrigatória.";
    if (!form.user.cpf.trim()) nextErrors.cpf = "CPF obrigatório.";
    if (!form.address.city.trim()) nextErrors.city = "Cidade obrigatória.";
    if (!form.user.username.trim()) nextErrors.username = "Nome de usuário obrigatório.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      setMessage("Preencha os campos obrigatórios antes de continuar.");
      return;
    }

    const result = await registerPlayer(form);
    setMessage(result.message);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-section">
        <h3 className="section-title">Seus dados</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Nome completo</span>
            <input value={form.user.name} onChange={(event) => setForm({ ...form, user: { ...form.user, name: event.target.value } })} />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>

          <label className="field">
            <span>Nome de usuário</span>
            <input value={form.user.username} onChange={(event) => setForm({ ...form, user: { ...form.user, username: event.target.value } })} />
            {errors.username ? <small>{errors.username}</small> : null}
          </label>

          <label className="field">
            <span>E-mail</span>
            <input type="email" value={form.user.email} onChange={(event) => setForm({ ...form, user: { ...form.user, email: event.target.value } })} />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className="field">
            <span>Telefone</span>
            <input value={form.user.phone} onChange={(event) => setForm({ ...form, user: { ...form.user, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>CPF</span>
            <input value={form.user.cpf} onChange={(event) => setForm({ ...form, user: { ...form.user, cpf: event.target.value } })} />
            {errors.cpf ? <small>{errors.cpf}</small> : null}
          </label>

          <label className="field">
            <span>Data de nascimento</span>
            <input type="date" value={form.user.birthDate} onChange={(event) => setForm({ ...form, user: { ...form.user, birthDate: event.target.value } })} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Sua conta</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Senha</span>
            <input type="password" value={form.user.password} onChange={(event) => setForm({ ...form, user: { ...form.user, password: event.target.value } })} />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <input type="password" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Onde você joga</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>CEP</span>
            <input value={form.address.zipCode} onChange={(event) => setForm({ ...form, address: { ...form.address, zipCode: event.target.value } })} />
          </label>

          <label className="field">
            <span>Estado</span>
            <input value={form.address.state} onChange={(event) => setForm({ ...form, address: { ...form.address, state: event.target.value } })} />
          </label>

          <label className="field">
            <span>Cidade</span>
            <input value={form.address.city} onChange={(event) => setForm({ ...form, address: { ...form.address, city: event.target.value } })} />
            {errors.city ? <small>{errors.city}</small> : null}
          </label>

          <label className="field">
            <span>Bairro</span>
            <input value={form.address.neighborhood} onChange={(event) => setForm({ ...form, address: { ...form.address, neighborhood: event.target.value } })} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Seus esportes</h3>
        <div className="sport-selection">
          <div className="checkbox-grid">
            <label><input type="checkbox" defaultChecked /> Futebol</label>
            <label><input type="checkbox" /> Futsal</label>
            <label><input type="checkbox" defaultChecked /> Beach Tennis</label>
            <label><input type="checkbox" /> Tênis</label>
            <label><input type="checkbox" /> Vôlei</label>
          </div>
          <div className="inline-actions justify-start">
            <button type="button" className="secondary-button">+ Adicionar outro esporte</button>
          </div>
        </div>
      </div>

      <div className="action-row">
        <button type="submit" className="primary-button">Criar conta</button>
      </div>

      {message ? <p className="success-message">{message}</p> : null}
    </form>
  );
}
