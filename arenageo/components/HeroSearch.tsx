export function HeroSearch() {
  return (
    <div className="search-panel" aria-label="Busca de espaços esportivos">
      <div className="search-field">
        <label htmlFor="location">Localização</label>
        <input id="location" type="text" defaultValue="Porto Alegre, RS" />
      </div>
      <div className="search-field">
        <label htmlFor="sport">Esporte</label>
        <select id="sport" defaultValue="futebol">
          <option value="futebol">Futebol</option>
          <option value="beach-tennis">Beach Tennis</option>
          <option value="tenis">Tênis</option>
          <option value="futsal">Futsal</option>
          <option value="volei">Vôlei</option>
          <option value="basquete">Basquete</option>
        </select>
      </div>
      <div className="search-field">
        <label htmlFor="date">Data</label>
        <input id="date" type="date" defaultValue="2026-08-21" />
      </div>
      <div className="search-field">
        <label htmlFor="time">Horário</label>
        <input id="time" type="time" defaultValue="18:00" />
      </div>
      <button type="button" className="primary-button search-button">
        Pesquisar
      </button>
    </div>
  );
}
