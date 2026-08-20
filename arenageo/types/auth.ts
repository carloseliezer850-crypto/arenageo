export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPlayerRequest {
  user: {
    name: string;
    username: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    password: string;
  };
  address: {
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    latitude: number | null;
    longitude: number | null;
  };
  sports: {
    sportId: number;
    skillLevelId: number;
  }[];
}

export interface RegisterBusinessRequest {
  responsible: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    password: string;
  };
  company: {
    legalName: string;
    tradeName: string;
    cnpj: string;
    stateRegistration?: string;
    businessPhone: string;
    businessEmail: string;
  };
  address: {
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
    latitude: number | null;
    longitude: number | null;
  };
  arena: {
    name: string;
    description: string;
    imageUrl?: string;
    phone: string;
    email: string;
    website?: string;
    instagram?: string;
    openingHours: string;
  };
}

export interface CreateMatchRequest {
  creatorId: number;
  sportId: number;
  spaceId: number | null;
  title: string;
  description: string;
  dateTime: string;
  durationMinutes: number;
  maxPlayers: number;
  skillLevelId: number;
  city: string;
  visibility: "public" | "private";
}
