import Link from "next/link";
import type { Sport } from "@/types/esporte";

type CategoriasEsportivasProps = {
  sports: Sport[];
};

export function CategoriasEsportivas({ sports }: CategoriasEsportivasProps) {
  return (
    <section className="sports-section" aria-labelledby="sports-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Modalidades</p>
          <h2 id="sports-heading">Encontre pela sua modalidade</h2>
        </div>
      </div>

      <div className="sport-grid">
        {sports.map((sport) => (
          <Link key={sport.id} href={`/partidas?esporte=${sport.id}`} className="sport-card">
            <span className="sport-icon" aria-hidden="true" />
            <span>{sport.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

