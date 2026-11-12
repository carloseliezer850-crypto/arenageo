"use client";
import { consultarCep } from "@/services/servicoCep";
import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { UFS, type Erros, erroSenha } from "@/lib/cadastro";
export function Campo({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  const password = props.type === "password";
  return (
    <label className="field">
      <span>
        {label}
        {props.required ? " *" : " (opcional)"}
      </span>
      <input
        {...props}
        id={props.name}
        type={password && visible ? "text" : props.type}
        aria-invalid={!!error}
        aria-describedby={error ? props.name + "-erro" : undefined}
      />
      {password && (
        <button type="button" onClick={() => setVisible(!visible)}>
          {visible ? "Ocultar" : "Mostrar"} senha
        </button>
      )}
      {error && (
        <small className="field-error" id={props.name + "-erro"}>
          {error}
        </small>
      )}
    </label>
  );
}
export function SenhaInfo({ value }: { value: string }) {
  return (
    <p className="field-hint">
      {erroSenha(value) || "Comprimento aceito."} Use uma frase-senha; espaços e
      acentos são permitidos. Máximo de 72 bytes UTF-8.
    </p>
  );
}
export function EnderecoCampos({
  prefix = "address",
  value,
  onChange,
  onFill,
  errors,
  comercial = false,
}: {
  prefix?: string;
  value: {
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    street?: string;
    number?: string;
    complement?: string;
  };
  onChange: (key: string, value: string) => void;
  onFill?: (patch: Record<string, string>) => void;
  errors: Erros;
  comercial?: boolean;
}) {
  const [cepStatus, setCepStatus] = useState("");
  const current = useRef({ value, onFill });
  useEffect(() => {
    current.current = { value, onFill };
  });
  useEffect(() => {
    const cep = value.zipCode.replace(/-/g, "");
    if (!/^\d{8}$/.test(cep)) return;
    let active = true;
    const snapshot = { ...value };
    const timer = setTimeout(() => {
      consultarCep(cep).then((result) => {
        if (!active) return;
        setCepStatus(result.error ?? "CEP localizado. Confira o endereço.");
        if (result.address) {
          const patch: Record<string, string> = {};
          for (const key of [
            "city",
            "state",
            "neighborhood",
            "street",
          ] as const) {
            if (
              result.address[key] &&
              current.current.value[key] === snapshot[key]
            )
              patch[key] = result.address[key];
          }
          current.current.onFill?.(patch);
        }
      });
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // Postal lookup only restarts when the postal code changes; other edits must be preserved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.zipCode]);
  return (
    <div className="form-grid two-columns">
      <p role="status">{cepStatus}</p>
      <Campo
        label="CEP"
        name={prefix + ".zipCode"}
        inputMode="numeric"
        autoComplete="postal-code"
        value={value.zipCode}
        onChange={(e) => onChange("zipCode", e.target.value)}
        error={errors[prefix + ".zipCode"]}
      />
      <label className="field">
        <span>Estado *</span>
        <select
          id={prefix + ".state"}
          name={prefix + ".state"}
          required
          value={value.state}
          onChange={(e) => onChange("state", e.target.value)}
          aria-invalid={!!errors[prefix + ".state"]}
          aria-describedby={prefix + ".state-erro"}
        >
          <option value="">Selecione o estado</option>
          {UFS.map((uf) => (
            <option key={uf}>{uf}</option>
          ))}
        </select>
        <small id={prefix + ".state-erro"}>{errors[prefix + ".state"]}</small>
      </label>
      <Campo
        label="Cidade"
        name={prefix + ".city"}
        required
        maxLength={120}
        autoComplete="address-level2"
        value={value.city}
        onChange={(e) => onChange("city", e.target.value)}
        error={errors[prefix + ".city"]}
      />
      <Campo
        label="Bairro"
        name={prefix + ".neighborhood"}
        maxLength={120}
        value={value.neighborhood}
        onChange={(e) => onChange("neighborhood", e.target.value)}
        error={errors[prefix + ".neighborhood"]}
      />
      {comercial && (
        <>
          {(["street", "number", "complement"] as const).map((key, i) => (
            <Campo
              key={key}
              name={prefix + "." + key}
              label={["Logradouro", "Número (ou S/N)", "Complemento"][i]}
              value={value[key] ?? ""}
              maxLength={[160, 20, 120][i]}
              onChange={(e) => onChange(key, e.target.value)}
              error={errors[prefix + "." + key]}
            />
          ))}
        </>
      )}
    </div>
  );
}
export function focarErro(errors: Erros) {
  requestAnimationFrame(() => {
    const first = Object.keys(errors)[0];
    (
      document.getElementById(first) ??
      document.querySelector('[aria-invalid="true"]')
    )?.scrollIntoView({ block: "center" });
    (document.getElementById(first) as HTMLElement | null)?.focus();
  });
}
