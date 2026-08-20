"use client";

import { useState } from "react";
import type { LoginRequest } from "@/types/auth";
import { login } from "@/services/authService";

const initialState: LoginRequest = {
  email: "",
  password: "",
  rememberMe: true,
};

export function LoginForm() {
  const [form, setForm] = useState<LoginRequest>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.email.trim()) nextErrors.email = "E-mail obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "E-mail inválido.";

    if (!form.password) nextErrors.password = "Senha obrigatória.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setMessage("Não foi possível entrar. Verifique seu e-mail e senha.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const result = await login(form);
    setMessage(result.message);
    setIsSubmitting(false);
  };

  return (
    <div className="login-shell">
      <div className="login-visual">
        <div className="login-visual-inner">
          <span className="eyebrow">ArenaGeo</span>
          <h2>Encontre pessoas para jogar.</h2>
          <p>Entre na sua conta e descubra partidas, jogadores e oportunidades para praticar perto de você.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-header">
          <h3>Entrar</h3>
          <p>Entre na sua conta ArenaGeo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className={errors.password ? "input-error" : ""}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={Boolean(form.rememberMe)} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })} />
              Lembrar-me
            </label>
            <a href="/register" className="text-link">Esqueci minha senha</a>
          </div>

          <button type="submit" className="primary-button auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <div className="auth-divider">
            <span>Não possui uma conta?</span>
          </div>

          <a href="/register" className="secondary-button button-link auth-button secondary-auth-button">Criar conta</a>

          {message ? <p className="message-box">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
