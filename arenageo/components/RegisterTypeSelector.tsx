"use client";

import { useState } from "react";

export function RegisterTypeSelector() {
  const [selected, setSelected] = useState<"player" | "business" | null>(null);

  return (
    <div className="route-stack account-selection-shell">
      <div className="account-selector">
        <button
          type="button"
          className={`selector-card ${selected === "player" ? "selected" : ""}`}
          onClick={() => setSelected("player")}
        >
          <span className="selector-badge">Jogador</span>
          <strong>Quero encontrar pessoas para jogar</strong>
          <p>Encontre partidas, conheça jogadores e participe de jogos próximos a você.</p>
          <span className="selector-link">Criar conta de jogador</span>
        </button>

        <button
          type="button"
          className={`selector-card ${selected === "business" ? "selected" : ""}`}
          onClick={() => setSelected("business")}
        >
          <span className="selector-badge business">Arena</span>
          <strong>Quero cadastrar minha arena</strong>
          <p>Cadastre seus espaços, receba reservas e conecte sua arena aos jogadores.</p>
          <span className="selector-link">Criar conta comercial</span>
        </button>
      </div>

      <div className="inline-actions justify-center">
        {selected === "player" ? (
          <a href="/register/player" className="primary-button">Continuar como jogador</a>
        ) : null}
        {selected === "business" ? (
          <a href="/register/business" className="primary-button">Continuar como comerciante</a>
        ) : null}
      </div>
    </div>
  );
}
