"use server";
export async function consultarCep(cep: string) {
  if (!/^\d{8}$/.test(cep)) return { error: "Informe um CEP com 8 dígitos." };
  try {
    const r = await fetch("https://viacep.com.br/ws/" + cep + "/json/", {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!r.ok) throw Error();
    const d = await r.json();
    if (d.erro)
      return {
        error:
          "CEP não encontrado. Confira ou preencha o endereço manualmente.",
      };
    return {
      address: {
        city: String(d.localidade ?? ""),
        state: String(d.uf ?? ""),
        neighborhood: String(d.bairro ?? ""),
        street: String(d.logradouro ?? ""),
      },
    };
  } catch {
    return {
      error:
        "Não foi possível consultar o CEP. Preencha o endereço manualmente.",
    };
  }
}
