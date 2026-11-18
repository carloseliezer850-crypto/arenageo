export function BuscaPartida() {
  return (
    <form
      className="match-search"
      action="/partidas"
      aria-label="Busca de partidas"
    >
      <label className="search-field">
        Cidade
        <input name="cidade" maxLength={120} placeholder="Informe uma cidade" />
      </label>
      <label className="search-field">
        UF
        <select name="uf" defaultValue="">
          <option value="">Todas</option>
          {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
            .split(" ")
            .map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
        </select>
      </label>
      <label className="search-field">
        Data
        <input name="data" type="date" />
      </label>
      <button className="primary-button">Encontrar partidas</button>
    </form>
  );
}
