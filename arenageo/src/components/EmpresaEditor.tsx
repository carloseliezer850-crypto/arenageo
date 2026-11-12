"use client";
import { useRef, useState } from "react";
import { salvarEmpresa, type EditarEmpresa } from "@/services/servicoGestao";
import { Campo, EnderecoCampos, focarErro } from "./CamposCadastro";
import type { Erros } from "@/lib/cadastro";
import { useToast } from "./ToastProvider";
export function EmpresaEditor({
  id,
  initial,
}: {
  id: number;
  initial: EditarEmpresa;
}) {
  const [v, setV] = useState(initial),
    [errors, setErrors] = useState<Erros>({}),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false),
    toast = useToast();
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        try {
          const r = await salvarEmpresa(id, v);
          setMessage(r.message);
          toast(r.message);
          setErrors(r.fields);
          if (r.success && r.data) setV(r.data);
          else focarErro(r.fields);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      {(
        [
          "legalName",
          "tradeName",
          "cnpj",
          "stateRegistration",
          "businessPhone",
          "businessEmail",
        ] as const
      ).map((k, i) => (
        <Campo
          key={k}
          name={"company." + k}
          label={
            [
              "Razão social",
              "Nome fantasia",
              "CNPJ",
              "Inscrição estadual (ou ISENTO)",
              "Telefone comercial",
              "E-mail comercial",
            ][i]
          }
          required={i !== 3}
          value={v.company[k] ?? ""}
          error={errors["company." + k]}
          onChange={(e) =>
            setV({ ...v, company: { ...v.company, [k]: e.target.value } })
          }
        />
      ))}
      <EnderecoCampos
        comercial
        value={{
          ...v.address,
          zipCode: v.address.zipCode ?? "",
          neighborhood: v.address.neighborhood ?? "",
        }}
        errors={errors}
        onFill={(patch) =>
          setV((prev) => ({ ...prev, address: { ...prev.address, ...patch } }))
        }
        onChange={(key, value) =>
          setV({ ...v, address: { ...v.address, [key]: value } })
        }
      />
      {message && <p role="status">{message}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Salvando…" : "Salvar empresa"}
      </button>
    </form>
  );
}
