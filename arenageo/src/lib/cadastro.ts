import type {
  RegisterPlayerRequest,
  RegisterBusinessRequest,
} from "@/types/autenticacao";
export const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " ",
  );
export type Erros = Record<string, string>;
export const enderecoVazio = {
  zipCode: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  number: "",
  complement: "",
  latitude: null,
  longitude: null,
};
export const jogadorVazio: RegisterPlayerRequest = {
  user: {
    name: "",
    username: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    password: "",
  },
  address: { ...enderecoVazio },
  sports: [],
};
export const empresaVazia: RegisterBusinessRequest = {
  responsible: { name: "", cpf: "", email: "", phone: "", password: "" },
  company: {
    legalName: "",
    tradeName: "",
    cnpj: "",
    stateRegistration: "",
    businessPhone: "",
    businessEmail: "",
  },
  address: { ...enderecoVazio },
  arena: {
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    openingHours: "",
  },
};
const digito = (n: number) => (n % 11 < 2 ? 0 : 11 - (n % 11));
export function cpfValido(value: string) {
  if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(value)) return false;
  const v = value.replace(/[.-]/g, "");
  return (
    !/^(\d)\1{10}$/.test(v) &&
    [9, 10].every(
      (n) =>
        digito(
          [...v.slice(0, n)].reduce(
            (s, c, i) => s + Number(c) * (n + 1 - i),
            0,
          ),
        ) === Number(v[n]),
    )
  );
}
export function cnpjValido(value: string) {
  if (
    !/^(?:[a-z\d]{12}\d{2}|[a-z\d]{2}\.[a-z\d]{3}\.[a-z\d]{3}\/[a-z\d]{4}-\d{2})$/i.test(
      value,
    )
  )
    return false;
  const v = value.replace(/[./-]/g, "").toUpperCase();
  return (
    !/^(\d)\1{13}$/.test(v) &&
    [12, 13].every(
      (n) =>
        digito(
          [...v.slice(0, n)].reduce(
            (s, c, i) => s + (c.charCodeAt(0) - 48) * (((n - 1 - i) % 8) + 2),
            0,
          ),
        ) === Number(v[n]),
    )
  );
}
export function formatarDocumento(value: string, cnpj = false) {
  // Preserve unexpected characters so validation can explain them instead of silently accepting them.
  if (!(cnpj ? /^[a-z\d./-]*$/i : /^[\d.-]*$/).test(value)) return value;
  const v = value.replace(/[./-]/g, "").toUpperCase();
  if (cnpj)
    return v
      .slice(0, 14)
      .replace(/^(.{2})(.)/, "$1.$2")
      .replace(/^(.{2})\.(.{3})(.)/, "$1.$2.$3")
      .replace(/^(.{2})\.(.{3})\.(.{3})(.)/, "$1.$2.$3/$4")
      .replace(/(\/.{4})(.)/, "$1-$2");
  return v
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
export function erroSenha(value: string, email = "", username = "") {
  if ([...value].length < 12) return "Use pelo menos 12 caracteres.";
  if (new TextEncoder().encode(value).length > 72)
    return "Esta senha ultrapassa o limite de 72 bytes UTF-8.";
  if (
    [
      "123456789012",
      "1234567890123",
      "password1234",
      "senha12345678",
      "qwerty1234567",
      "abcdefghijkl",
      email.toLowerCase(),
      username.toLowerCase(),
    ].includes(value.toLowerCase()) ||
    new Set(value).size === 1
  )
    return "Escolha uma senha menos comum.";
  return "";
}
export function telefoneValido(v: string) {
  if (!/^[+\d() .-]+$/.test(v)) return false;
  let d = v.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return (
    /^[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(d) &&
    "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99"
      .split(" ")
      .includes(d.slice(0, 2))
  );
}
function campo(
  e: Erros,
  k: string,
  v: string | undefined,
  max: number,
  required = false,
) {
  if (required && !v?.trim()) e[k] = "Preencha este campo.";
  else if ((v?.length ?? 0) > max) e[k] = `Use no máximo ${max} caracteres.`;
}
function email(e: Erros, k: string, v: string) {
  campo(e, k, v, 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
    e[k] = "Informe um e-mail válido.";
}
function telefone(e: Erros, k: string, v: string, required = false) {
  if ((required || v) && !telefoneValido(v))
    e[k] = "Informe um telefone válido com DDD.";
}
function endereco(e: Erros, k: string, v: RegisterPlayerRequest["address"]) {
  campo(e, k + ".city", v.city, 120, true);
  campo(e, k + ".neighborhood", v.neighborhood, 120);
  if (!UFS.includes(v.state)) e[k + ".state"] = "Selecione seu estado.";
  if (v.zipCode && !/^\d{5}-?\d{3}$/.test(v.zipCode))
    e[k + ".zipCode"] = "Informe um CEP com 8 dígitos.";
  if (
    (v.latitude === null) !== (v.longitude === null) ||
    (v.latitude !== null && Math.abs(v.latitude) > 90) ||
    (v.longitude !== null && Math.abs(v.longitude) > 180)
  )
    e[k + ".latitude"] = "Informe latitude e longitude válidas, juntas.";
}
export function validarJogador(
  v: RegisterPlayerRequest,
  confirmacao: string,
): Erros {
  const e: Erros = {};
  campo(e, "user.name", v.user.name, 160, true);
  email(e, "user.email", v.user.email);
  if (!/^[a-z\d._]{3,30}$/i.test(v.user.username))
    e["user.username"] =
      "Use de 3 a 30 caracteres: letras, números, ponto ou sublinhado.";
  if (!cpfValido(v.user.cpf)) e["user.cpf"] = "Informe um CPF válido.";
  telefone(e, "user.phone", v.user.phone);
  const s = erroSenha(v.user.password, v.user.email, v.user.username);
  if (s) e["user.password"] = s;
  if (v.user.password !== confirmacao)
    e.confirmacao = "As senhas não coincidem.";
  if (v.user.birthDate) {
    const d = new Date(v.user.birthDate + "T12:00:00");
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    if (
      Number.isNaN(d.getTime()) ||
      d > hoje ||
      d.toISOString().slice(0, 10) !== v.user.birthDate
    )
      e["user.birthDate"] =
        "Informe uma data de nascimento válida, sem futuro.";
  }
  endereco(e, "address", v.address);
  if (!v.sports.length) e.sports = "Selecione pelo menos um esporte.";
  v.sports.forEach((s, i) => {
    if (!s.skillLevelId)
      e[`sports[${i}].skillLevelId`] = "Selecione seu nível neste esporte.";
  });
  return e;
}
export function validarEmpresa(
  v: RegisterBusinessRequest,
  confirmacao: string,
  existente: boolean,
): Erros {
  const e: Erros = {};
  if (!existente) {
    campo(e, "responsible.name", v.responsible.name, 160, true);
    email(e, "responsible.email", v.responsible.email);
    telefone(e, "responsible.phone", v.responsible.phone, true);
    if (!cpfValido(v.responsible.cpf))
      e["responsible.cpf"] = "Informe um CPF válido.";
    const s = erroSenha(v.responsible.password, v.responsible.email);
    if (s) e["responsible.password"] = s;
    if (v.responsible.password !== confirmacao)
      e.confirmacao = "As senhas não coincidem.";
  }
  campo(e, "company.legalName", v.company.legalName, 180, true);
  campo(e, "company.tradeName", v.company.tradeName, 180, true);
  campo(e, "company.stateRegistration", v.company.stateRegistration, 30);
  if (!cnpjValido(v.company.cnpj))
    e["company.cnpj"] = "Informe um CNPJ válido.";
  telefone(e, "company.businessPhone", v.company.businessPhone, true);
  email(e, "company.businessEmail", v.company.businessEmail);
  endereco(e, "address", v.address);
  if (v.arenaAddress) endereco(e, "arenaAddress", v.arenaAddress);
  for (const [prefix, a] of [
    ["address", v.address],
    ["arenaAddress", v.arenaAddress],
  ] as const) {
    if (a) {
      campo(e, prefix + ".street", a.street, 160);
      campo(e, prefix + ".number", a.number, 20);
      campo(e, prefix + ".complement", a.complement, 120);
    }
  }
  campo(e, "arena.name", v.arena.name, 160, true);
  campo(e, "arena.description", v.arena.description, 10000);
  campo(e, "arena.instagram", v.arena.instagram, 120);
  campo(e, "arena.openingHours", v.arena.openingHours, 5000);
  telefone(e, "arena.phone", v.arena.phone, true);
  email(e, "arena.email", v.arena.email);
  if (v.arena.website) {
    try {
      const u = new URL(v.arena.website);
      if (
        !["http:", "https:"].includes(u.protocol) ||
        u.username ||
        v.arena.website.length > 500
      )
        throw Error();
    } catch {
      e["arena.website"] = "Informe um endereço http ou https válido.";
    }
  }
  return e;
}
