export function CreateMatch() {
  return (
    <section className="create-match-section" aria-labelledby="create-match-heading">
      <div className="create-match-panel">
        <div className="create-match-copy">
          <p className="eyebrow">Criar partida</p>
          <h2 id="create-match-heading">Monte seu jogo em poucos passos</h2>
          <p>
            Defina esporte, data, nível, local e quantidade de jogadores. Sua partida fica visível
            para pessoas próximas que querem jogar no mesmo horário.
          </p>
        </div>

        <div className="create-match-form" aria-label="Formulário para criar partida">
          <div className="mini-field">
            <label htmlFor="create-sport">Esporte</label>
            <select id="create-sport" defaultValue="futebol">
              <option value="futebol">Futebol</option>
              <option value="futsal">Futsal</option>
              <option value="beach-tennis">Beach Tennis</option>
            </select>
          </div>
          <div className="mini-field">
            <label htmlFor="create-date">Data</label>
            <input id="create-date" type="date" defaultValue="2026-08-20" />
          </div>
          <div className="mini-field">
            <label htmlFor="create-time">Horário</label>
            <input id="create-time" type="time" defaultValue="19:30" />
          </div>
          <div className="mini-field">
            <label htmlFor="create-players">Jogadores</label>
            <select id="create-players" defaultValue="10">
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
          </div>
          <button type="button" className="primary-button create-button">
            Publicar partida
          </button>
        </div>
      </div>
    </section>
  );
}
