import type { Space } from "@/types/space";

export const spaces: Space[] = [
  {
    id: 1,
    arenaId: 1,
    sportId: 1,
    name: "Quadra 7x7 Premium",
    description: "Campo profissional com grama sintética, drenagem eficiente e excelente iluminação.",
    pricePerHour: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
  {
    id: 2,
    arenaId: 1,
    sportId: 3,
    name: "Quadra Beach Tennis",
    description: "Arena aberta com areia premium, redes oficiais e atmosfera de competição.",
    pricePerHour: 90,
    imageUrl:
      "https://images.unsplash.com/photo-1595435934249-5df7edf78c84?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
  {
    id: 3,
    arenaId: 2,
    sportId: 2,
    name: "Futsal Arena Pro",
    description: "Quadra fechada com piso esportivo, marcações oficiais e reforço para treino.",
    pricePerHour: 110,
    imageUrl:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
  {
    id: 4,
    arenaId: 2,
    sportId: 5,
    name: "Vôlei Indoor",
    description: "Espaço para treino e partidas rápidas em ambiente controlado e seguro.",
    pricePerHour: 95,
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
  {
    id: 5,
    arenaId: 3,
    sportId: 4,
    name: "Quadra de Tênis Club",
    description: "Superfície de alto desempenho com área de aquecimento e revisão técnica.",
    pricePerHour: 140,
    imageUrl:
      "https://images.unsplash.com/photo-1554068861-66d7d2fa7d67?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
  {
    id: 6,
    arenaId: 3,
    sportId: 6,
    name: "Basquete Arena 3x3",
    description: "Cesta profissional e piso antiaderente para treino técnico e partidas rápidas.",
    pricePerHour: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    active: true,
  },
];
