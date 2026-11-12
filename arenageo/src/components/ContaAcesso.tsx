"use client";
import { useEffect, useState } from "react";
import { acaoConta } from "@/services/servicoConta";
import { erroSenha } from "@/lib/cadastro";
import { Campo, SenhaInfo } from "./CamposCadastro";
export function ContaAcesso() {
  const [tipo, setTipo] = useState(""),
    [token, setToken] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTipo(new URLSearchParams(location.search).get("tipo") ?? "");
      setToken(new URLSearchParams(location.hash.slice(1)).get("token") ?? "");
      history.replaceState(null, "", location.pathname + location.search);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return (
    <form
      className="form-card"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        if (
          tipo === "RESET" &&
          (erroSenha(password) || password !== confirmation)
        ) {
          setMessage(erroSenha(password) || "As senhas não coincidem.");
          return;
        }
        setBusy(true);
        try {
          const action = token
            ? tipo === "RESET"
              ? "redefinir"
              : "confirmar"
            : "recuperar";
          const r = await acaoConta(
            action,
            token ? { token, password } : { email },
          );
          setMessage(r.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {token ? (
        tipo === "RESET" ? (
          <>
            <Campo
              label="Nova senha"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Campo
              label="Confirmar senha"
              name="confirmation"
              required
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
            <SenhaInfo value={password} />
          </>
        ) : (
          <p>
            Confirme seu endereço de e-mail para concluir a verificação da
            conta.
          </p>
        )
      ) : (
        <Campo
          label="E-mail da conta"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
      <button className="primary-button" disabled={busy}>
        {busy
          ? "Enviando…"
          : token
            ? tipo === "RESET"
              ? "Redefinir senha"
              : "Confirmar e-mail"
            : "Recuperar acesso"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
export function ReenviarConfirmacao() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            setMessage((await acaoConta("reenviar", {})).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Reenviar confirmação de e-mail
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
