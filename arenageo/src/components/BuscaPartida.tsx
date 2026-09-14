export function BuscaPartida() {
  return (
    <div className="match-search" aria-label="Busca de partidas">
      <div className="search-field">
        <label htmlFor="match-sport">Esporte</label>
        <select id="match-sport" defaultValue="">
          <option value="" disabled>Selecione o esporte</option>
          <option value="futebol">Futebol</option>
          <option value="futsal">Futsal</option>
          <option value="beach-tennis">Beach Tennis</option>
          <option value="tenis">Tênis</option>
          <option value="volei">Vôlei</option>
          <option value="basquete">Basquete</option>
        </select>
      </div>

      <div className="search-field">
        <label htmlFor="match-location">Localização</label>
        <input id="match-location" type="text" placeholder="Informe uma cidade" />
      </div>

      <div className="search-field">
        <label htmlFor="match-date">Data</label>
        <input id="match-date" type="date" />
      </div>

      <div className="search-field">
        <label htmlFor="match-time">Horário</label>
        <input id="match-time" type="time" />
      </div>

      <div className="search-field">
        <label htmlFor="match-skill">Nível</label>
        <select id="match-skill" defaultValue="">
          <option value="" disabled>Selecione o nível</option>
          <option value="intermediario">Intermediário</option>
          <option value="iniciante">Iniciante</option>
          <option value="avancado">Avançado</option>
        </select>
      </div>

      <div className="search-field">
        <label htmlFor="match-players">Jogadores</label>
        <select id="match-players" defaultValue="">
          <option value="" disabled>Selecione</option>
          <option value="4">4</option>
          <option value="6">6</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>

      <button type="button" className="primary-button match-search-button">
        Encontrar partidas
      </button>
    </div>
  );
}

