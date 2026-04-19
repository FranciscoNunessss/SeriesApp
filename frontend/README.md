# Frontend - Series Tracker

Frontend React/Vite ligado ao backend FastAPI em `/api/v1`.

## Requisitos

- Backend + base de dados já a correr em Docker (API exposta em `http://localhost:8000`)
- Node.js 20+

## Configuração

1. Copia o ficheiro de exemplo de variáveis:

```bash
Copy-Item .env.example .env
```

2. Instala dependências:

```bash
npm install
```

3. Arranca o frontend:

```bash
npm run dev
```

Frontend disponível em `http://localhost:5173`.

## Nota sobre API

- `VITE_API_BASE_URL` define o endpoint do backend.
- Valor default esperado para desenvolvimento local: `http://localhost:8000/api/v1`.

## Se o Windows bloquear o Rollup (.node)

Se aparecer erro de `Application Control` / `ERR_DLOPEN_FAILED` com `@rollup/rollup-win32-x64-msvc`, usa o frontend em Docker:

```bash
docker compose up -d --build frontend-dev
```

Depois abre `http://localhost:5173`.
