"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/types/match";
import type { SkillLevel } from "@/types/skillLevel";
import type { Sport } from "@/types/sport";

type MatchFiltersProps = {
  matches: Match[];
  sports: Sport[];
  skillLevels: SkillLevel[];
};

type MatchFilterState = {
  sportId: string;
  city: string;
  distance: string;
  date: string;
  time: string;
  skillLevelId: string;
  playersNeeded: string;
  status: string;
};

const defaultFilters: MatchFilterState = {
  sportId: "",
  city: "",
  distance: "",
  date: "",
  time: "",
  skillLevelId: "",
  playersNeeded: "",
  status: "",
};

export function MatchFilters({ matches, sports, skillLevels }: MatchFiltersProps) {
  const [filters, setFilters] = useState<MatchFilterState>(defaultFilters);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const sportMatch = !filters.sportId || match.sportId === Number(filters.sportId);
      const cityMatch = !filters.city || match.city.toLowerCase().includes(filters.city.toLowerCase());
      const dateMatch = !filters.date || match.dateTime.startsWith(filters.date);
      const timeMatch = !filters.time || match.dateTime.slice(11, 16) === filters.time;
      const skillMatch =
        !filters.skillLevelId || match.skillLevelId === Number(filters.skillLevelId);
      const playersMatch =
        !filters.playersNeeded || match.maxPlayers - match.currentPlayers >= Number(filters.playersNeeded);
      const statusMatch = !filters.status || match.statusId === Number(filters.status);

      return sportMatch && cityMatch && dateMatch && timeMatch && skillMatch && playersMatch && statusMatch;
    });
  }, [filters, matches]);

  const updateFilter = (field: keyof MatchFilterState, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <div className="route-stack">
      <div className="filter-panel">
        <div className="form-grid">
          <label className="field">
            <span>Esporte</span>
            <select value={filters.sportId} onChange={(event) => updateFilter("sportId", event.target.value)}>
              <option value="">Selecione</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Cidade</span>
            <input
              value={filters.city}
              onChange={(event) => updateFilter("city", event.target.value)}
              placeholder="Bagé"
            />
          </label>

          <label className="field">
            <span>Distância</span>
            <select value={filters.distance} onChange={(event) => updateFilter("distance", event.target.value)}>
              <option value="">Qualquer</option>
              <option value="5">Até 5 km</option>
              <option value="10">Até 10 km</option>
              <option value="20">Até 20 km</option>
            </select>
          </label>

          <label className="field">
            <span>Data</span>
            <input type="date" value={filters.date} onChange={(event) => updateFilter("date", event.target.value)} />
          </label>

          <label className="field">
            <span>Horário</span>
            <input type="time" value={filters.time} onChange={(event) => updateFilter("time", event.target.value)} />
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
            <span>Jogadores disponíveis</span>
            <select value={filters.playersNeeded} onChange={(event) => updateFilter("playersNeeded", event.target.value)}>
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option value="">Todos</option>
              <option value="1">Aberta</option>
              <option value="2">Cheia</option>
            </select>
          </label>
        </div>

        <div className="inline-actions">
          <button type="button" className="primary-button">Pesquisar</button>
          <button type="button" className="secondary-button" onClick={clearFilters}>Limpar filtros</button>
        </div>
      </div>

      <div className="results-header">
        <h2>Partidas encontradas</h2>
        <span>{filteredMatches.length} resultado(s)</span>
      </div>

      <div className="cards-grid">
        {filteredMatches.map((match) => {
          const sport = sports.find((item) => item.id === match.sportId);
          const skill = skillLevels.find((item) => item.id === match.skillLevelId);
          const vacancies = Math.max(match.maxPlayers - match.currentPlayers, 0);

          return (
            <article key={match.id} className="match-card">
              <div className="match-card-header">
                <div>
                  <span className="badge">{sport?.name ?? "Esporte"}</span>
                  <h3>{match.title}</h3>
                </div>
                <span className="status-tag">{match.statusId === 1 ? "Aberta" : "Cheia"}</span>
              </div>

              <div className="match-meta-row">
                <span>{new Date(match.dateTime).toLocaleDateString("pt-BR")}</span>
                <span>{new Date(match.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div className="match-location">
                <strong>{match.city}</strong>
                <span>{match.state}</span>
              </div>

              <div className="match-detail-grid">
                <span>{skill?.name ?? "Nível"}</span>
                <span>{match.currentPlayers} / {match.maxPlayers} jogadores</span>
              </div>

              <p className="muted-copy">{vacancies} vagas disponíveis</p>

              <div className="card-footer">
                <span>Id: {match.id}</span>
                <a href={`/matches/${match.id}`} className="text-link">Ver partida</a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
