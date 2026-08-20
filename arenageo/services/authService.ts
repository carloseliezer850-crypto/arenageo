import type {
  LoginRequest,
  RegisterBusinessRequest,
  RegisterPlayerRequest,
} from "@/types/auth";

export async function login(data: LoginRequest) {
  return {
    success: true,
    message: "Login simulado com sucesso.",
    user: {
      id: 1,
      email: data.email,
      accountTypeId: 1,
    },
  };
}

export async function registerPlayer(data: RegisterPlayerRequest) {
  return {
    success: true,
    message: "Cadastro do jogador registrado com sucesso.",
    data,
  };
}

export async function registerBusiness(data: RegisterBusinessRequest) {
  return {
    success: true,
    message: "Cadastro do comerciante registrado com sucesso.",
    data,
  };
}
