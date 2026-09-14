"use client";

import { useState } from "react";
import { cadastrarEmpresa } from "@/services/servicoAutenticacao";
import type { RegisterBusinessRequest } from "@/types/autenticacao";

const initialState: RegisterBusinessRequest = {
  responsible: {
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
  },
  company: {
    legalName: "",
    tradeName: "",
    cnpj: "",
    stateRegistration: "",
    businessPhone: "",
    businessEmail: "",
  },
  address: {
    zipCode: "",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    latitude: null,
    longitude: null,
  },
  arena: {
    name: "",
    description: "",
    imageUrl: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    openingHours: "",
  },
};

export function FormularioCadastroEmpresa() {
  const [form, setForm] = useState<RegisterBusinessRequest>(initialState);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await cadastrarEmpresa(form);
      setMessage(result.message);
    } catch {
      setMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-section">
        <h3 className="section-title">Responsável</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Nome completo</span>
            <input value={form.responsible.name} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, name: event.target.value } })} />
          </label>

          <label className="field">
            <span>CPF</span>
            <input value={form.responsible.cpf} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, cpf: event.target.value } })} />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input type="email" value={form.responsible.email} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, email: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone</span>
            <input value={form.responsible.phone} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" value={form.responsible.password} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, password: event.target.value } })} />
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <input type="password" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Empresa</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Razão social</span>
            <input value={form.company.legalName} onChange={(event) => setForm({ ...form, company: { ...form.company, legalName: event.target.value } })} />
          </label>

          <label className="field">
            <span>Nome fantasia</span>
            <input value={form.company.tradeName} onChange={(event) => setForm({ ...form, company: { ...form.company, tradeName: event.target.value } })} />
          </label>

          <label className="field">
            <span>CNPJ</span>
            <input value={form.company.cnpj} onChange={(event) => setForm({ ...form, company: { ...form.company, cnpj: event.target.value } })} />
          </label>

          <label className="field">
            <span>Inscrição estadual</span>
            <input value={form.company.stateRegistration ?? ""} onChange={(event) => setForm({ ...form, company: { ...form.company, stateRegistration: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone comercial</span>
            <input value={form.company.businessPhone} onChange={(event) => setForm({ ...form, company: { ...form.company, businessPhone: event.target.value } })} />
          </label>

          <label className="field">
            <span>E-mail comercial</span>
            <input type="email" value={form.company.businessEmail} onChange={(event) => setForm({ ...form, company: { ...form.company, businessEmail: event.target.value } })} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Endereço</h3>
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
          </label>

          <label className="field">
            <span>Bairro</span>
            <input value={form.address.neighborhood} onChange={(event) => setForm({ ...form, address: { ...form.address, neighborhood: event.target.value } })} />
          </label>

          <label className="field">
            <span>Rua</span>
            <input value={form.address.street} onChange={(event) => setForm({ ...form, address: { ...form.address, street: event.target.value } })} />
          </label>

          <label className="field">
            <span>Número</span>
            <input value={form.address.number} onChange={(event) => setForm({ ...form, address: { ...form.address, number: event.target.value } })} />
          </label>

          <label className="field full-width">
            <span>Complemento</span>
            <input value={form.address.complement ?? ""} onChange={(event) => setForm({ ...form, address: { ...form.address, complement: event.target.value } })} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Arena</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Nome da arena</span>
            <input value={form.arena.name} onChange={(event) => setForm({ ...form, arena: { ...form.arena, name: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone comercial</span>
            <input value={form.arena.phone} onChange={(event) => setForm({ ...form, arena: { ...form.arena, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>E-mail comercial</span>
            <input type="email" value={form.arena.email} onChange={(event) => setForm({ ...form, arena: { ...form.arena, email: event.target.value } })} />
          </label>

          <label className="field">
            <span>Instagram</span>
            <input value={form.arena.instagram ?? ""} onChange={(event) => setForm({ ...form, arena: { ...form.arena, instagram: event.target.value } })} />
          </label>

          <label className="field">
            <span>Website</span>
            <input value={form.arena.website ?? ""} onChange={(event) => setForm({ ...form, arena: { ...form.arena, website: event.target.value } })} />
          </label>

          <label className="field">
            <span>Horário de funcionamento</span>
            <input value={form.arena.openingHours} onChange={(event) => setForm({ ...form, arena: { ...form.arena, openingHours: event.target.value } })} />
          </label>

          <label className="field full-width">
            <span>Descrição</span>
            <textarea rows={4} value={form.arena.description} onChange={(event) => setForm({ ...form, arena: { ...form.arena, description: event.target.value } })} />
          </label>
        </div>
      </div>

      <div className="action-row">
        <button type="submit" className="primary-button">Criar conta comercial</button>
      </div>

      {message ? <p className="success-message">{message}</p> : null}
    </form>
  );
}

