import { enviarApi } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type {
  AuthResponse,
  LoginRequest,
  RegisterBusinessRequest,
  RegisterPlayerRequest,
} from "@/types/autenticacao";

export function entrar(data: LoginRequest): Promise<AuthResponse> {
  return enviarApi<AuthResponse, LoginRequest>(rotasApi.auth.entrar, data);
}

export function cadastrarJogador(data: RegisterPlayerRequest): Promise<AuthResponse> {
  return enviarApi<AuthResponse, RegisterPlayerRequest>(rotasApi.players, data);
}

export function cadastrarEmpresa(data: RegisterBusinessRequest): Promise<AuthResponse> {
  return enviarApi<AuthResponse, RegisterBusinessRequest>(rotasApi.businesses, data);
}

