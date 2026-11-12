"use client";
import { useRef, useState } from "react";
import { salvarPerfil, type Perfil } from "@/services/servicoPerfil";
import { Campo, EnderecoCampos, focarErro } from "./CamposCadastro";
import { EsportesCadastro } from "./EsportesCadastro";
import { useToast } from "./ToastProvider";
import type { Erros } from "@/lib/cadastro";
export function PerfilJogador({ initial }: { initial: Perfil }) {
  const [form, setForm] = useState(initial),
    [errors, setErrors] = useState<Erros>({}),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  const toast = useToast();
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current || !ready) return;
        lock.current = true;
        setBusy(true);
        try {
          const r = await salvarPerfil(form);
          toast(r.message);
          setMessage(r.message);
          setErrors(r.fields);
          if (r.success && r.profile) setForm(r.profile);
          else focarErro(r.fields);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <Campo
        name="name"
        label="Nome"
        required
        value={form.name}
        error={errors.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Campo
        name="phone"
        label="Telefone"
        type="tel"
        value={form.phone ?? ""}
        error={errors.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <EnderecoCampos
        onFill={(patch) =>
          setForm((prev) => ({
            ...prev,
            address: { ...prev.address, ...patch },
          }))
        }
        value={{
          ...form.address,
          zipCode: form.address.zipCode ?? "",
          neighborhood: form.address.neighborhood ?? "",
        }}
        errors={errors}
        onChange={(key, value) =>
          setForm({ ...form, address: { ...form.address, [key]: value } })
        }
      />
      <EsportesCadastro
        value={form.sports}
        errors={errors}
        onReady={setReady}
        onChange={(sports) => setForm({ ...form, sports })}
      />
      <button className="primary-button" disabled={busy || !ready}>
        {busy ? "Salvando…" : "Salvar perfil"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
