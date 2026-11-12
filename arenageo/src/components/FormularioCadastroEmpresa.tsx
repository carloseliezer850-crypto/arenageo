"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cadastrarEmpresa, cadastrarEmpresaNaConta } from "@/services/servicoAutenticacao";
import type { RegisterBusinessRequest } from "@/types/autenticacao";

const formatarCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11)
  .replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
  .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

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

export function FormularioCadastroEmpresa({ contaExistente }: { contaExistente: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<RegisterBusinessRequest>(initialState);
  const [confirmacao, setConfirmacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    const cpf = form.responsible.cpf.replace(/\D/g, "");
    const cpfValido = (value: string) => {
      if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false;
      return [9, 10].every((length) => {
        const sum = value.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
        const remainder = (sum * 10) % 11;
        return Number(value[length]) === (remainder === 10 ? 0 : remainder);
      });
    };
    if (!contaExistente && !cpfValido(cpf)) {
      setMessage("Informe um CPF válido, incluindo os dígitos verificadores.");
      return;
    }
    if (form.address.zipCode && !/^\d{5}-?\d{3}$/.test(form.address.zipCode)) {
      setMessage("Informe um CEP com 8 dígitos.");
      return;
    }

    if (!contaExistente && confirmacao !== form.responsible.password) {
      setMessage("As senhas informadas precisam coincidir.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = contaExistente
        ? await cadastrarEmpresaNaConta({ company: form.company, address: form.address, arena: form.arena })
        : await cadastrarEmpresa(form);
      if (result.success) {
        router.replace("/painel?cidade=" + encodeURIComponent(form.address.city));
        return;
      }
      setMessage(result.message);
    } catch {
      setMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {!contaExistente && <div className="form-section">
        <h3 className="section-title">Responsável</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Nome completo</span>
            <input required value={form.responsible.name} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, name: event.target.value } })} />
          </label>

          <label className="field">
            <span>CPF</span>
            <input inputMode="numeric" maxLength={14} value={formatarCpf(form.responsible.cpf)} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, cpf: formatarCpf(event.target.value) } })} />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input type="email" required value={form.responsible.email} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, email: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone</span>
            <input required value={form.responsible.phone} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" required minLength={8} maxLength={72} value={form.responsible.password} onChange={(event) => setForm({ ...form, responsible: { ...form.responsible, password: event.target.value } })} />
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <input type="password" required minLength={8} maxLength={72} value={confirmacao} onChange={event => setConfirmacao(event.target.value)} />
          </label>
        </div>
      </div>}

      <div className="form-section">
        <h3 className="section-title">Empresa</h3>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Razão social</span>
            <input required value={form.company.legalName} onChange={(event) => setForm({ ...form, company: { ...form.company, legalName: event.target.value } })} />
          </label>

          <label className="field">
            <span>Nome fantasia</span>
            <input required value={form.company.tradeName} onChange={(event) => setForm({ ...form, company: { ...form.company, tradeName: event.target.value } })} />
          </label>

          <label className="field">
            <span>CNPJ</span>
            <input required value={form.company.cnpj} onChange={(event) => setForm({ ...form, company: { ...form.company, cnpj: event.target.value } })} />
          </label>

          <label className="field">
            <span>Inscrição estadual</span>
            <input value={form.company.stateRegistration ?? ""} onChange={(event) => setForm({ ...form, company: { ...form.company, stateRegistration: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone comercial</span>
            <input required value={form.company.businessPhone} onChange={(event) => setForm({ ...form, company: { ...form.company, businessPhone: event.target.value } })} />
          </label>

          <label className="field">
            <span>E-mail comercial</span>
            <input type="email" required value={form.company.businessEmail} onChange={(event) => setForm({ ...form, company: { ...form.company, businessEmail: event.target.value } })} />
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
            <select required value={form.address.state} onChange={(event) => setForm({ ...form, address: { ...form.address, state: event.target.value } })}><option value="">Selecione o estado</option><option value="AC">Acre (AC)</option><option value="AL">Alagoas (AL)</option><option value="AP">Amapá (AP)</option><option value="AM">Amazonas (AM)</option><option value="BA">Bahia (BA)</option><option value="CE">Ceará (CE)</option><option value="DF">Distrito Federal (DF)</option><option value="ES">Espírito Santo (ES)</option><option value="GO">Goiás (GO)</option><option value="MA">Maranhão (MA)</option><option value="MT">Mato Grosso (MT)</option><option value="MS">Mato Grosso do Sul (MS)</option><option value="MG">Minas Gerais (MG)</option><option value="PA">Pará (PA)</option><option value="PB">Paraíba (PB)</option><option value="PR">Paraná (PR)</option><option value="PE">Pernambuco (PE)</option><option value="PI">Piauí (PI)</option><option value="RJ">Rio de Janeiro (RJ)</option><option value="RN">Rio Grande do Norte (RN)</option><option value="RS">Rio Grande do Sul (RS)</option><option value="RO">Rondônia (RO)</option><option value="RR">Roraima (RR)</option><option value="SC">Santa Catarina (SC)</option><option value="SP">São Paulo (SP)</option><option value="SE">Sergipe (SE)</option><option value="TO">Tocantins (TO)</option></select>
          </label>

          <label className="field">
            <span>Cidade</span>
            <input required value={form.address.city} onChange={(event) => setForm({ ...form, address: { ...form.address, city: event.target.value } })} />
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
            <input required value={form.arena.name} onChange={(event) => setForm({ ...form, arena: { ...form.arena, name: event.target.value } })} />
          </label>

          <label className="field">
            <span>Telefone comercial</span>
            <input required value={form.arena.phone} onChange={(event) => setForm({ ...form, arena: { ...form.arena, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>E-mail comercial</span>
            <input type="email" required value={form.arena.email} onChange={(event) => setForm({ ...form, arena: { ...form.arena, email: event.target.value } })} />
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
        <button type="submit" disabled={isSubmitting} className="primary-button">{contaExistente ? "Cadastrar arena na minha conta" : "Criar conta comercial"}</button>
      </div>

      {message ? <p role="alert" aria-live="assertive" className="message-box">{message}</p> : null}
    </form>
  );
}

