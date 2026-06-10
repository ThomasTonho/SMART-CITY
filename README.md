# PROJETO INTEGRADOR - SMART CITY

É uma plataforma web de gestão e observabilidade de sensores IoT, com controle de acesso por perfil, API segura via JWT e interface React para operação diária e análise rápida de dados

## Estrutura do projeto

```
INTEGRADOR/                    ← raiz do repositório
├── docs/                      ← imagens do README (ex.: download.jpg)
├── backend/                   ← API Django (manage.py fica aqui)
│   ├── manage.py
│   ├── requirements.txt       ← dependências Python do backend
│   ├── api/
│   └── smartcity/
└── frontend/
    └── integrador/            ← app React (package.json fica aqui)
        ├── package.json
        └── src/
```

## Onde entrar para rodar

Abra **dois terminais**. Em ambos, comece na pasta raiz do projeto (`INTEGRADOR`).

| O que fazer | Pasta em que você deve estar | Arquivo de referência |
|-------------|------------------------------|------------------------|
| Backend (venv, pip, requirements, migrate, runserver) | `INTEGRADOR/backend` | `manage.py`, `requirements.txt` |
| Frontend (npm install, npm run dev) | `INTEGRADOR/frontend/integrador` | `package.json` |

### Caminhos no Windows (PowerShell)

Se o projeto está na Área de Trabalho:

```powershell
# Raiz do projeto
cd C:\Users\52741832803\Desktop\INTEGRADOR

# Terminal 1 — backend
cd backend

# Terminal 2 — frontend (a partir da raiz)
cd frontend\integrador
```

> Todos os comandos `python manage.py ...` devem ser executados **dentro de `backend/`**.  
> Todos os comandos `npm ...` devem ser executados **dentro de `frontend/integrador/`**.

## Requisitos

### Backend

- Python 3.12+ (recomendado)
- Dependências listadas em `backend/requirements.txt` (instalar com `pip install -r requirements.txt`)
- MySQL rodando localmente
- Banco configurado em `backend/smartcity/settings.py`:
  - `NAME=smart`
  - `USER=root`
  - `PASSWORD=root`
  - `HOST=localhost`
  - `PORT=3306`

Crie o banco no MySQL antes de rodar as migrações, se ainda não existir:

```sql
CREATE DATABASE smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Frontend

- Node.js 18+ (recomendado)
- npm

## Como rodar o projeto

### Terminal 1 — Backend (pasta `backend/`)

```powershell
cd C:\Users\52741832803\Desktop\INTEGRADOR\backend
```

Crie e ative o ambiente virtual (ainda em `backend/`):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Instale as dependências do backend a partir do `requirements.txt` (ainda em `backend/`):

```powershell
pip install -r requirements.txt
```

> É obrigatório instalar o `requirements.txt` antes de rodar `migrate` ou `runserver`. Sem isso, o Django e as bibliotecas da API não estarão disponíveis.

Aplique as migrações (ainda em `backend/`):

```powershell
python manage.py migrate
```

Suba o servidor (ainda em `backend/`):

```powershell
python manage.py runserver
```

- API: `http://127.0.0.1:8000/api/`
- Admin Django: `http://127.0.0.1:8000/admin/`

### Terminal 2 — Frontend (pasta `frontend/integrador/`)

```powershell
cd C:\Users\52741832803\Desktop\INTEGRADOR\frontend\integrador
```

Instale as dependências (ainda em `frontend/integrador/`):

```powershell
npm install
```

Inicie o app (ainda em `frontend/integrador/`):

```powershell
npm run dev
```

- Interface: `http://127.0.0.1:5173`

O frontend usa a API em `http://127.0.0.1:8000` por padrão. Para outra URL, crie um arquivo `.env` em `frontend/integrador/`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Scripts úteis (sempre em `frontend/integrador/`)

```powershell
cd C:\Users\52741832803\Desktop\INTEGRADOR\frontend\integrador
```

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | Executa o ESLint |

## Ordem recomendada

1. Subir o MySQL e garantir o banco `smart`.
2. **Terminal 1:** entrar em `backend/` → ativar venv → `pip install -r requirements.txt` → `migrate` → `runserver`.
3. **Terminal 2:** entrar em `frontend/integrador/` → `npm install` → `npm run dev`.
4. Acessar `http://127.0.0.1:5173` no navegador.

## Observações

- O backend aceita requisições do frontend em `localhost:5173` (CORS configurado em `backend/smartcity/settings.py`).
- Erro de conexão com o banco: confira se o MySQL está ativo e se usuário/senha/nome do banco batem com o `settings.py`.
- Erro `manage.py not found`: você não está na pasta `backend/`.
- Erro `package.json not found`: você não está na pasta `frontend/integrador/`.
