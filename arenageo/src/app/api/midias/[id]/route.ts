import { URL_BASE_API } from "@/api/cliente";
import { obterToken } from "@/services/sessao";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await obterToken();
  if (!token) return new Response(null, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 400 });
  const r = await fetch(URL_BASE_API + "/midias/" + id, {
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
  });
  return new Response(r.body, {
    status: r.status,
    headers: {
      "Content-Type": r.ok ? "image/png" : "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
