"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { novaArena } from "@/services/servicoGestao";
import { empresaVazia, type Erros } from "@/lib/cadastro";
import { Campo, EnderecoCampos, focarErro } from "./CamposCadastro";
import { useToast } from "./ToastProvider";
export function NovaArena({
  companies,
}: {
  companies: { id: number; name: string }[];
}) {
  const [company, setCompany] = useState(companies[0]?.id ?? 0),
    [v, setV] = useState({
      arena: empresaVazia.arena,
      address: empresaVazia.address,
    }),
    [errors, setErrors] = useState<Erros>({}),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const key = useRef<string | undefined>(undefined),
    lock = useRef(false),
    toast = useToast(),
    router = useRouter();
  if (!companies.length) return <p>Cadastre primeiro sua empresa.</p>;
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        key.current ??= crypto.randomUUID();
        try {
          const r = await novaArena(company, v, key.current);
          toast(r.message);
          setMessage(r.message);
          setErrors(r.fields);
          if (r.success && r.data) router.push("/gestao/" + r.data.id);
          else {
            focarErro(r.fields);
            if (Object.keys(r.fields).length) key.current = undefined;
          }
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <label>
        Empresa
        <select
          value={company}
          onChange={(e) => setCompany(Number(e.target.value))}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {(["name", "phone", "email"] as const).map((k, i) => (
        <Campo
          key={k}
          label={["Nome da arena", "Telefone", "E-mail"][i]}
          name={"arena." + k}
          required
          value={v.arena[k]}
          error={errors["arena." + k]}
          onChange={(e) =>
            setV({ ...v, arena: { ...v.arena, [k]: e.target.value } })
          }
        />
      ))}
      <EnderecoCampos
        onFill={(patch) =>
          setV((prev) => ({ ...prev, address: { ...prev.address, ...patch } }))
        }
        comercial
        value={v.address}
        errors={errors}
        onChange={(k, value) =>
          setV({ ...v, address: { ...v.address, [k]: value } })
        }
      />
      {message && <p role="status">{message}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Criando…" : "Criar arena e completar estrutura"}
      </button>
    </form>
  );
}
