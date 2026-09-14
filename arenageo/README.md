# ArenaGeo

Frontend em Next.js, TypeScript e React preparado para consumir uma API Java com Spring Boot.

## Estrutura

- `src/app`: rotas do Next.js App Router.
- `src/components`: componentes reutilizáveis e formulários.
- `src/api`: cliente HTTP compartilhado.
- `src/services`: serviços de domínio que comunicam com o backend.
- `src/types`: contratos TypeScript das entidades e requisições.
- `src/hooks` e `src/utils`: extensões futuras para hooks e funções auxiliares.

## Configuração da API

Copie `.env.example` para `.env.local` e ajuste a URL do Spring Boot:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Endpoints esperados pelo frontend:

- `POST /usuarios/login`
- `POST /jogadores`
- `POST /empresas`
- `GET /usuarios`
- `GET /jogadores`
- `GET /partidas`
- `POST /partidas`
- `GET /esportes`
- `GET /niveis`
- `GET /arenas`
- `GET /espacos`
- `GET /reservas`

Enquanto a API estiver desligada, as consultas retornam listas vazias para que o frontend apresente seus estados vazios. Erros HTTP do backend continuam sendo propagados para tratamento na interface.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
