"use client";

import { useMemo, useState } from "react";
import type { Player } from "@/types/player";
import type { SkillLevel } from "@/types/skillLevel";
import type { Sport } from "@/types/sport";

type PlayerFiltersProps = {
  players: Player[];
  sports: Sport[];
  skillLevels: SkillLevel[];
};

type PlayerFilterState = {
  name: string;
  sportId: string;
  city: string;
  distance: string;
  skillLevelId: string;
  availability: string;
  sort: string;
};

const defaultFilters: PlayerFilterState = {
  name: "",
  sportId: "",
  city: "",
  distance: "",
  skillLevelId: "",
  availability: "",
  sort: "nearest",
};

export function PlayerFilters({ players, sports, skillLevels }: PlayerFiltersProps) {
  const [filters, setFilters] = useState<PlayerFilterState>(defaultFilters);

  const filteredPlayers = useMemo(() => {
    const filtered = players.filter((player) => {
      const nameMatch = !filters.name || player.name.toLowerCase().includes(filters.name.toLowerCase());
      const cityMatch = !filters.city || player.city.toLowerCase().includes(filters.city.toLowerCase());
      const levelMatch =
        !filters.skillLevelId || player.skillLevelId === Number(filters.skillLevelId);
      const availabilityMatch = !filters.availability || filters.availability === "today";

      return nameMatch && cityMatch && levelMatch && availabilityMatch;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return a.id - b.id;
    });
  }, [filters, players]);

  const updateFilter = (field: keyof PlayerFilterState, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <div className="route-stack">
      <div className="filter-panel">
        <div className="form-grid">
          <label className="field">
            <span>Nome</span>
            <input value={filters.name} onChange={(event) => updateFilter("name", event.target.value)} placeholder="Ex: Carlos" />
          </label>

          <label className="field">
            <span>Esporte</span>
            <select value={filters.sportId} onChange={(event) => updateFilter("sportId", event.target.value)}>
              <option value="">Todos</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Cidade</span>
            <input value={filters.city} onChange={(event) => updateFilter("city", event.target.value)} placeholder="Bagé" />
          </label>

          <label className="field">
            <span>Distância máxima</span>
            <select value={filters.distance} onChange={(event) => updateFilter("distance", event.target.value)}>
              <option value="">Qualquer</option>
              <option value="5">Até 5 km</option>
              <option value="10">Até 10 km</option>
              <option value="20">Até 20 km</option>
            </select>
          </label>

          <label className="field">
            <span>Nível</span>
            <select value={filters.skillLevelId} onChange={(event) => updateFilter("skillLevelId", event.target.value)}>
              <option value="">Todos</option>
              {skillLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Disponibilidade</span>
            <select value={filters.availability} onChange={(event) => updateFilter("availability", event.target.value)}>
              <option value="">Qualquer</option>
              <option value="today">Hoje</option>
              <option value="weekend">Fim de semana</option>
            </select>
          </label>

          <label className="field">
            <span>Ordenação</span>
            <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="nearest">Mais próximos</option>
              <option value="name">Nome</option>
            </select>
          </label>
        </div>

        <div className="inline-actions">
          <button type="button" className="primary-button">Pesquisar</button>
          <button type="button" className="secondary-button" onClick={clearFilters}>Limpar filtros</button>
        </div>
      </div>

      <div className="results-header">
        <h2>Jogadores encontrados</h2>
        <span>{filteredPlayers.length} resultado(s)</span>
      </div>

      <div className="cards-grid">
        {filteredPlayers.map((player) => {
          const skill = skillLevels.find((item) => item.id === player.skillLevelId);

          return (
            <article key={player.id} className="player-card">
              <img src={player.profileImageUrl} alt={player.name} className="player-avatar" />
              <div className="player-card-body">
                <h3>{player.name}</h3>
                <p>{player.city} - {player.state}</p>
                <div className="player-meta">
                  <span>{skill?.name ?? "Nível"}</span>
                  <span>{player.active ? "Disponível" : "Indisponível"}</span>
                </div>
                <a href={`/players/${player.id}`} className="secondary-button player-button">Ver perfil</a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
