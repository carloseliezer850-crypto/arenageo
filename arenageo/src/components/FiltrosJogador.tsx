import Link from "next/link";
import type { Sport } from "@/types/esporte";
import type { SkillLevel } from "@/types/nivelHabilidade";
export function FiltrosJogador({
  values,
  sports,
  levels,
}: {
  values: Record<string, string>;
  sports: Sport[];
  levels: SkillLevel[];
}) {
  return (
    <form action="/jogadores" className="form-card">
      <label className="field">
        Nome público
        <input name="query" maxLength={80} defaultValue={values.query} />
      </label>
      <label className="field">
        Cidade
        <input name="city" maxLength={120} defaultValue={values.city} />
      </label>
      <label className="field">
        UF
        <select name="state" defaultValue={values.state}>
          <option value="">Todas</option>
          {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
            .split(" ")
            .map((s) => (
              <option key={s}>{s}</option>
            ))}
        </select>
      </label>
      <label className="field">
        Esporte
        <select name="sport" defaultValue={values.sport}>
          <option value="">Todos</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Nível no esporte
        <select name="level" defaultValue={values.level}>
          <option value="">Todos</option>
          {levels.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Data disponível
        <input name="date" type="date" defaultValue={values.date} />
      </label>
      <label className="field">
        Período
        <select name="period" defaultValue={values.period}>
          <option value="">Qualquer</option>
          <option value="madrugada">00h–06h</option>
          <option value="manha">06h–12h</option>
          <option value="tarde">12h–18h</option>
          <option value="noite">18h–24h</option>
        </select>
      </label>
      <p>
        Escolha esporte ao filtrar nível, e data ao filtrar período. Horários no
        fuso declarado pelo jogador; ordem alfabética. Nenhuma distância é
        estimada.
      </p>
      <button className="primary-button">Pesquisar jogadores</button>
      <Link href="/jogadores">Limpar filtros</Link>
    </form>
  );
}
