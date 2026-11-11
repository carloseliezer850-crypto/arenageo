"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cadastrarJogador } from "@/services/servicoAutenticacao";
import type { RegisterPlayerRequest } from "@/types/autenticacao";

const formatarCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11)
  .replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
  .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

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
  sports: [],
};

export function FormularioCadastroJogador() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPlayerRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmacao, setConfirmacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  };

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
    if (isSubmitting) return;
    const cpf = form.user.cpf.replace(/\D/g, "");
    const cpfValido = (value: string) => {
      if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false;
      return [9, 10].every((length) => {
        const sum = value.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
        const remainder = (sum * 10) % 11;
        return Number(value[length]) === (remainder === 10 ? 0 : remainder);
      });
    };
    if (!cpfValido(cpf)) {
      setMessage("Informe um CPF válido, incluindo os dígitos verificadores.");
      return;
    }
    if (form.address.zipCode && !/^\d{5}-?\d{3}$/.test(form.address.zipCode)) {
      setMessage("Informe um CEP com 8 dígitos.");
      return;
    }

    if (confirmacao !== form.user.password) {
      setMessage("As senhas informadas precisam coincidir.");
      return;
    }

    if (!validate()) {
      setMessage("Preencha os campos obrigatórios antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await cadastrarJogador(form);
      if (result.success) {
        router.replace("/painel");
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
      <div className="form-section">
        <h3 className="section-title">Seus dados</h3>
        <div className="profile-photo-field">
          <div className="profile-photo-preview" aria-hidden="true">
            {photoPreview ? <img src={photoPreview} alt="" /> : <span>Foto</span>}
          </div>
          <div>
            <label className="field">
              <span>Foto de perfil</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
            </label>
            <small>JPG, PNG ou WebP. A foto poderá ser enviada ao backend posteriormente.</small>
          </div>
        </div>
        <div className="form-grid two-columns">
          <label className="field">
            <span>Nome completo</span>
            <input required value={form.user.name} onChange={(event) => setForm({ ...form, user: { ...form.user, name: event.target.value } })} />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>

          <label className="field">
            <span>Nome de usuário</span>
            <input required value={form.user.username} onChange={(event) => setForm({ ...form, user: { ...form.user, username: event.target.value } })} />
            {errors.username ? <small>{errors.username}</small> : null}
          </label>

          <label className="field">
            <span>E-mail</span>
            <input type="email" required value={form.user.email} onChange={(event) => setForm({ ...form, user: { ...form.user, email: event.target.value } })} />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className="field">
            <span>Telefone</span>
            <input value={form.user.phone} onChange={(event) => setForm({ ...form, user: { ...form.user, phone: event.target.value } })} />
          </label>

          <label className="field">
            <span>CPF</span>
            <input inputMode="numeric" maxLength={14} value={formatarCpf(form.user.cpf)} onChange={(event) => setForm({ ...form, user: { ...form.user, cpf: formatarCpf(event.target.value) } })} />
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
            <input type="password" required minLength={8} maxLength={72} value={form.user.password} onChange={(event) => setForm({ ...form, user: { ...form.user, password: event.target.value } })} />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <input type="password" required minLength={8} maxLength={72} value={confirmacao} onChange={event => setConfirmacao(event.target.value)} />
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
            <select required value={form.address.state} onChange={(event) => setForm({ ...form, address: { ...form.address, state: event.target.value } })}><option value="">Selecione o estado</option><option value="AC">Acre (AC)</option><option value="AL">Alagoas (AL)</option><option value="AP">Amapá (AP)</option><option value="AM">Amazonas (AM)</option><option value="BA">Bahia (BA)</option><option value="CE">Ceará (CE)</option><option value="DF">Distrito Federal (DF)</option><option value="ES">Espírito Santo (ES)</option><option value="GO">Goiás (GO)</option><option value="MA">Maranhão (MA)</option><option value="MT">Mato Grosso (MT)</option><option value="MS">Mato Grosso do Sul (MS)</option><option value="MG">Minas Gerais (MG)</option><option value="PA">Pará (PA)</option><option value="PB">Paraíba (PB)</option><option value="PR">Paraná (PR)</option><option value="PE">Pernambuco (PE)</option><option value="PI">Piauí (PI)</option><option value="RJ">Rio de Janeiro (RJ)</option><option value="RN">Rio Grande do Norte (RN)</option><option value="RS">Rio Grande do Sul (RS)</option><option value="RO">Rondônia (RO)</option><option value="RR">Roraima (RR)</option><option value="SC">Santa Catarina (SC)</option><option value="SP">São Paulo (SP)</option><option value="SE">Sergipe (SE)</option><option value="TO">Tocantins (TO)</option></select>
          </label>

          <label className="field">
            <span>Cidade</span>
            <input required value={form.address.city} onChange={(event) => setForm({ ...form, address: { ...form.address, city: event.target.value } })} />
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
            <label><input type="checkbox" /> Futebol</label>
            <label><input type="checkbox" /> Futsal</label>
            <label><input type="checkbox" /> Beach Tennis</label>
            <label><input type="checkbox" /> Tênis</label>
            <label><input type="checkbox" /> Vôlei</label>
          </div>
          <div className="inline-actions justify-start">
            <button type="button" className="secondary-button">+ Adicionar outro esporte</button>
          </div>
        </div>
      </div>

      <div className="action-row">
        <button type="submit" disabled={isSubmitting} className="primary-button">Criar conta</button>
      </div>

      {message ? <p role="alert" aria-live="assertive" className="message-box">{message}</p> : null}
    </form>
  );
}

