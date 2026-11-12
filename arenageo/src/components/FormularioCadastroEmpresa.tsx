"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cadastrarEmpresa,
  cadastrarEmpresaNaConta,
} from "@/services/servicoAutenticacao";
import {
  empresaVazia,
  validarEmpresa,
  formatarDocumento,
  type Erros,
} from "@/lib/cadastro";
import { Campo, EnderecoCampos, SenhaInfo, focarErro } from "./CamposCadastro";
import { useToast } from "./ToastProvider";
import type { RegisterBusinessRequest } from "@/types/autenticacao";
const fields = {
  responsible: [
    ["name", "Nome", "text", true],
    ["cpf", "CPF", "text", true],
    ["email", "E-mail", "email", true],
    ["phone", "Telefone", "tel", true],
    ["password", "Senha", "password", true],
  ],
  company: [
    ["legalName", "Razão social", "text", true],
    ["tradeName", "Nome fantasia", "text", true],
    ["cnpj", "CNPJ", "text", true],
    ["stateRegistration", "Inscrição estadual (ou ISENTO)", "text", false],
    ["businessPhone", "Telefone comercial", "tel", true],
    ["businessEmail", "E-mail comercial", "email", true],
  ],
  arena: [
    ["name", "Nome da arena", "text", true],
    ["phone", "Telefone da arena", "tel", true],
    ["email", "E-mail da arena", "email", true],
    ["website", "Website", "url", false],
    ["instagram", "Instagram", "text", false],
    ["openingHours", "Horário de funcionamento", "text", false],
  ],
} as const;
export function FormularioCadastroEmpresa({
  contaExistente,
}: {
  contaExistente: boolean;
}) {
  const [form, setForm] = useState(empresaVazia);
  const [confirmacao, setConfirmacao] = useState("");
  const [errors, setErrors] = useState<Erros>({});
  const [step, setStep] = useState(contaExistente ? 1 : 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const requestKey = useRef<string | undefined>(undefined);
  const toast = useToast();
  const router = useRouter();
  function update(next: RegisterBusinessRequest) {
    setForm(next);
    if (Object.keys(errors).length)
      setErrors(validarEmpresa(next, confirmacao, contaExistente));
  }
  function show(e: Erros) {
    setErrors(e);
    const key = Object.keys(e)[0] ?? "";
    setStep(
      key.startsWith("responsible") || key === "confirmacao"
        ? 0
        : key.startsWith("company") || key.startsWith("address")
          ? 1
          : 2,
    );
    focarErro(e);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const e = validarEmpresa(form, confirmacao, contaExistente);
    if (Object.keys(e).length) {
      show(e);
      toast("Revise os campos destacados.");
      return;
    }
    lock.current = true;
    requestKey.current ??= crypto.randomUUID();
    setBusy(true);
    setMessage("");
    try {
      const data = {
        ...form,
        responsible: {
          ...form.responsible,
          email: form.responsible.email.trim(),
        },
        company: {
          ...form.company,
          businessEmail: form.company.businessEmail.trim(),
        },
        arena: { ...form.arena, email: form.arena.email.trim() },
      };
      const result = contaExistente
        ? await cadastrarEmpresaNaConta(
            {
              company: data.company,
              address: data.address,
              arena: data.arena,
              arenaAddress: data.arenaAddress,
            },
            requestKey.current,
          )
        : await cadastrarEmpresa(data, requestKey.current);
      if (result.success) {
        toast(result.message);
        router.replace("/gestao");
      } else {
        if (result.status && result.status < 500)
          requestKey.current = undefined;
        if (result.fields && Object.keys(result.fields).length)
          show(result.fields);
        setMessage(result.message);
        toast(result.message);
      }
    } catch {
      setMessage(
        "Não foi possível confirmar o cadastro. Verifique sua conta antes de tentar novamente.",
      );
      toast("Não foi possível confirmar o cadastro.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function group(group: keyof typeof fields) {
    return (
      <div className="form-grid two-columns">
        {fields[group].map(([key, label, type, required]) => (
          <Campo
            key={key}
            name={group + "." + key}
            label={label}
            type={type}
            required={required}
            autoComplete={
              type === "password"
                ? "new-password"
                : type === "email"
                  ? "email"
                  : undefined
            }
            value={String(
              (form[group] as unknown as Record<string, string>)[key] ?? "",
            )}
            error={errors[group + "." + key]}
            onChange={(e) =>
              update({
                ...form,
                [group]: {
                  ...form[group],
                  [key]:
                    key === "cpf"
                      ? formatarDocumento(e.target.value)
                      : key === "cnpj"
                        ? formatarDocumento(e.target.value, true)
                        : e.target.value,
                },
              })
            }
          />
        ))}
      </div>
    );
  }
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={submit}
      onBlur={(event) => {
        const name =
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLSelectElement ||
          event.target instanceof HTMLTextAreaElement
            ? event.target.name
            : "";
        if (name) {
          const e = validarEmpresa(form, confirmacao, contaExistente);
          setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            if (e[name]) next[name] = e[name];
            return next;
          });
        }
      }}
    >
      <nav className="cadastro-steps" aria-label="Etapas do cadastro">
        {["Responsável", "Empresa", "Arena", "Revisão"].map(
          (label, i) =>
            (!contaExistente || i > 0) && (
              <button
                key={label}
                type="button"
                aria-current={step === i ? "step" : undefined}
                onClick={() => setStep(i)}
              >
                {label}
              </button>
            ),
        )}
      </nav>
      <p>
        * Campos obrigatórios. Endereços da empresa e da arena podem ser
        diferentes.
      </p>
      {!contaExistente && (
        <section hidden={step !== 0}>
          <h3>Responsável</h3>
          {group("responsible")}
          <Campo
            name="confirmacao"
            label="Confirmar senha"
            type="password"
            required
            autoComplete="new-password"
            value={confirmacao}
            error={errors.confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
          <SenhaInfo value={form.responsible.password} />
        </section>
      )}
      <section hidden={step !== 1}>
        <h3>Empresa</h3>
        {group("company")}
        <h3>Endereço da empresa</h3>
        <EnderecoCampos
          onFill={(patch) =>
            setForm((prev) => ({
              ...prev,
              address: { ...prev.address, ...patch },
            }))
          }
          comercial
          value={form.address}
          errors={errors}
          onChange={(key, value) =>
            update({ ...form, address: { ...form.address, [key]: value } })
          }
        />
      </section>
      <section hidden={step !== 2}>
        <h3>Arena</h3>
        {group("arena")}
        <label className="field">
          Descrição (opcional)
          <textarea
            name="arena.description"
            id="arena.description"
            maxLength={10000}
            value={form.arena.description}
            onChange={(e) =>
              update({
                ...form,
                arena: { ...form.arena, description: e.target.value },
              })
            }
          />
          <small>{errors["arena.description"]}</small>
        </label>
        <label>
          <input
            type="checkbox"
            checked={!form.arenaAddress}
            onChange={(e) =>
              update({
                ...form,
                arenaAddress: e.target.checked
                  ? undefined
                  : { ...form.address },
              })
            }
          />{" "}
          Usar o mesmo endereço da empresa
        </label>
        {form.arenaAddress && (
          <EnderecoCampos
            onFill={(patch) =>
              setForm((prev) => ({
                ...prev,
                arenaAddress: { ...prev.arenaAddress!, ...patch },
              }))
            }
            prefix="arenaAddress"
            comercial
            value={form.arenaAddress}
            errors={errors}
            onChange={(key, value) =>
              update({
                ...form,
                arenaAddress: { ...form.arenaAddress!, [key]: value },
              })
            }
          />
        )}
      </section>
      <section hidden={step !== 3}>
        <h3>Revise seu cadastro</h3>
        <p>Empresa: {form.company.tradeName}</p>
        <p>Arena: {form.arena.name}</p>
        <p>
          Localização: {(form.arenaAddress ?? form.address).city} /{" "}
          {(form.arenaAddress ?? form.address).state}
        </p>
        <p>
          {contaExistente
            ? "Seu perfil de jogador e esportes serão preservados."
            : "A conta do responsável será criada junto com a empresa e arena."}
        </p>
      </section>
      {message && (
        <p role="alert" className="message-box">
          {message}
        </p>
      )}
      <div className="action-row">
        {step > (contaExistente ? 1 : 0) && (
          <button type="button" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => setStep(step + 1)}
          >
            Continuar
          </button>
        ) : (
          <button type="submit" disabled={busy} className="primary-button">
            {busy ? "Salvando arena…" : "Salvar cadastro"}
          </button>
        )}
      </div>
    </form>
  );
}
