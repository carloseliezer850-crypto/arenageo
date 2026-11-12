"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarJogador } from "@/services/servicoAutenticacao";
import {
  jogadorVazio,
  validarJogador,
  formatarDocumento,
  type Erros,
} from "@/lib/cadastro";
import { Campo, EnderecoCampos, SenhaInfo, focarErro } from "./CamposCadastro";
import { EsportesCadastro } from "./EsportesCadastro";
import { useToast } from "./ToastProvider";
import type { RegisterPlayerRequest } from "@/types/autenticacao";
export function FormularioCadastroJogador() {
  const [form, setForm] = useState(jogadorVazio);
  const [confirmacao, setConfirmacao] = useState("");
  const [errors, setErrors] = useState<Erros>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const requestKey = useRef<string | undefined>(undefined);
  const toast = useToast();
  const router = useRouter();
  function update(next: RegisterPlayerRequest) {
    setForm(next);
    if (Object.keys(errors).length)
      setErrors(validarJogador(next, confirmacao));
  }
  function user(key: keyof RegisterPlayerRequest["user"], value: string) {
    update({ ...form, user: { ...form.user, [key]: value } });
  }
  function show(e: Erros) {
    setErrors(e);
    const key = Object.keys(e)[0];
    setStep(
      key === "sports" || key?.startsWith("sports[")
        ? 3
        : key?.startsWith("address.")
          ? 2
          : ["user.name", "user.cpf", "user.phone", "user.birthDate"].includes(
                key,
              )
            ? 1
            : 0,
    );
    focarErro(e);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const e = validarJogador(form, confirmacao);
    if (Object.keys(e).length) {
      show(e);
      toast("Revise os campos destacados.");
      return;
    }
    if (!ready) {
      setStep(3);
      toast("Aguarde o carregamento dos esportes e níveis.");
      return;
    }
    lock.current = true;
    requestKey.current ??= crypto.randomUUID();
    setBusy(true);
    setMessage("");
    try {
      const result = await cadastrarJogador(
        {
          ...form,
          user: {
            ...form.user,
            email: form.user.email.trim(),
            username: form.user.username.trim(),
          },
        },
        requestKey.current,
      );
      if (result.success) {
        toast(result.message);
        router.replace("/painel");
      } else {
        if (result.status && result.status < 500)
          requestKey.current = undefined;
        if (result.fields && Object.keys(result.fields).length)
          show(result.fields);
        setMessage(
          result.message +
            (result.traceId ? " Protocolo: " + result.traceId : ""),
        );
        toast(result.message);
      }
    } catch {
      setMessage(
        "Não foi possível confirmar o resultado. Confira sua conta antes de tentar novamente.",
      );
      toast("Não foi possível confirmar o cadastro.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const input = (
    key: keyof RegisterPlayerRequest["user"],
    label: string,
    type = "text",
    required = true,
  ) => (
    <Campo
      name={"user." + key}
      label={label}
      type={type}
      required={required}
      autoComplete={
        key === "password"
          ? "new-password"
          : key === "email"
            ? "email"
            : key === "username"
              ? "username"
              : key === "name"
                ? "name"
                : undefined
      }
      value={form.user[key] ?? ""}
      error={errors["user." + key]}
      onChange={(e) =>
        user(
          key,
          key === "cpf" ? formatarDocumento(e.target.value) : e.target.value,
        )
      }
    />
  );
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
          const e = validarJogador(form, confirmacao);
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
        {["Conta", "Dados pessoais", "Localização", "Esportes"].map(
          (name, i) => (
            <button
              key={name}
              type="button"
              aria-current={step === i ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              {i + 1}. {name}
            </button>
          ),
        )}
      </nav>
      <p>* Campos obrigatórios. Seus dados permanecem preenchidos ao voltar.</p>
      <section hidden={step !== 0}>
        <h3>Sua conta</h3>
        <div className="form-grid two-columns">
          {input("username", "Nome de usuário")}
          {input("email", "E-mail", "email")}
          {input("password", "Senha", "password")}
          <Campo
            label="Confirmar senha"
            name="confirmacao"
            required
            type="password"
            autoComplete="new-password"
            value={confirmacao}
            error={errors.confirmacao}
            onChange={(e) => {
              setConfirmacao(e.target.value);
              if (errors.confirmacao)
                setErrors({
                  ...errors,
                  confirmacao:
                    e.target.value === form.user.password
                      ? ""
                      : "As senhas não coincidem.",
                });
            }}
          />
        </div>
        <SenhaInfo value={form.user.password} />
      </section>
      <section hidden={step !== 1}>
        <h3>Dados pessoais</h3>
        <div className="form-grid two-columns">
          {input("name", "Nome")}
          {input("cpf", "CPF")}
          {input("phone", "Telefone", "tel", false)}
          {input("birthDate", "Nascimento", "date", false)}
        </div>
        <p>Você poderá completar a foto de perfil após criar a conta.</p>
      </section>
      <section hidden={step !== 2}>
        <h3>Onde você joga</h3>
        <EnderecoCampos
          onFill={(patch) =>
            setForm((prev) => ({
              ...prev,
              address: { ...prev.address, ...patch },
            }))
          }
          value={form.address}
          errors={errors}
          onChange={(key, value) =>
            update({ ...form, address: { ...form.address, [key]: value } })
          }
        />
      </section>
      <section hidden={step !== 3}>
        <EsportesCadastro
          value={form.sports}
          errors={errors}
          onReady={setReady}
          onChange={(sports) => update({ ...form, sports })}
        />
      </section>
      {message && (
        <p role="alert" className="message-box">
          {message}
        </p>
      )}
      <div className="action-row">
        {step > 0 && (
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
          <button
            type="submit"
            className="primary-button"
            disabled={busy || !ready}
          >
            {busy ? "Criando conta…" : "Criar conta"}
          </button>
        )}
      </div>
    </form>
  );
}
