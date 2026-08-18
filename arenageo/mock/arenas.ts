import type { Arena } from "@/types/arena";

export const arenas: Arena[] = [
  {
    id: 1,
    name: "Arena Sul",
    description: "Complexo completo com quadra sintética, vestiários e iluminação profissional.",
    address: "Rua das Flores, 245",
    city: "Bagé",
    state: "RS",
    latitude: -31.3314,
    longitude: -54.106,
    imageUrl:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    reviewCount: 184,
    ownerId: 2,
    active: true,
  },
  {
    id: 2,
    name: "Arena Norte",
    description: "Arenas de elite com clima premium para partidas e eventos esportivos.",
    address: "Avenida das Esportes, 900",
    city: "Porto Alegre",
    state: "RS",
    latitude: -30.0346,
    longitude: -51.2177,
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviewCount: 214,
    ownerId: 3,
    active: true,
  },
  {
    id: 3,
    name: "Court Club",
    description: "Espaço moderno para beach tennis, tênis e eventos de social club.",
    address: "Rua do Tênis, 18",
    city: "Florianópolis",
    state: "SC",
    latitude: -27.5949,
    longitude: -48.5482,
    imageUrl:
      "https://images.unsplash.com/photo-1554068861-66d7d2fa7d67?auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    reviewCount: 126,
    ownerId: 2,
    active: true,
  },
];
