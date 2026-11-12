export const URL_BASE_API = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields: Record<string, string> = {},
    public readonly code = "INTERNAL_ERROR",
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

type OpcoesRequisicaoApi = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function requisitarApi<T>(
  url: string,
  options: OpcoesRequisicaoApi = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const response = await fetch(`${URL_BASE_API}${url}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detalhe = await response.json().catch(() => null);
    const fallback =
      response.status === 401
        ? "E-mail ou senha inválidos. Entre novamente."
        : response.status === 403
          ? "Acesso não autorizado. Entre novamente na sua conta."
          : response.status >= 500
            ? "Não foi possível concluir a operação. Tente novamente mais tarde."
            : "Não foi possível concluir a solicitação.";
    const message = detalhe?.message || fallback;
    throw new ErroApi(
      response.status,
      message,
      detalhe?.fields ?? {},
      detalhe?.code,
      detalhe?.traceId,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function obterApi<T>(url: string): Promise<T> {
  return requisitarApi<T>(url, { method: "GET" });
}

export function enviarApi<TResponse, TBody>(
  url: string,
  body: TBody,
): Promise<TResponse> {
  return requisitarApi<TResponse>(url, { method: "POST", body });
}

export async function obterApiOuVazio<T>(url: string): Promise<T[]> {
  try {
    return await obterApi<T[]>(url);
  } catch (error) {
    if (error instanceof TypeError) {
      return [];
    }

    throw error;
  }
}
