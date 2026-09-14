export interface Business {
  id: number;
  userId: number;
  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration?: string;
  active: boolean;
  createdAt: string;
}

