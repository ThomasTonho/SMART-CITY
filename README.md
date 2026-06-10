# SMART CITY — Plataforma IoT

Plataforma web de gestão e monitoramento de sensores IoT com controle de acesso por perfil, API segura via JWT e interface React para operação e análise de dados em tempo real.

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Funcionalidades

- Cadastro e autenticação de usuários com perfis **Admin** e **Usuário**
- Gerenciamento de locais, ambientes e responsáveis
- Cadastro de microcontroladores com geolocalização (latitude/longitude)
- Cadastro de sensores por tipo: Temperatura, Umidade, Luminosidade e Contador
- Histórico de leituras por sensor com timestamp automático
- Importação de dados via CSV
- API RESTful protegida com JWT (access + refresh token)
- Interface React separada por perfil de acesso

---

## Estrutura do projeto

```
SMART-CITY/
├── backend/                   ← API Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── api/                   ← models, views, serializers, filtros
│   └── smartcity/             ← settings, urls, wsgi
└── frontend/
    └── integrador/            ← app React + Vite
        ├── package.json
        └── src/
            └── pages/         ← admin/, login/, register/, user/
```

---

## Pré-requisitos

| Componente | Versão mínima |
|------------|--------------|
| Python | 3.12+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## Como rodar

Abra **dois terminais** a partir da raiz do projeto.

### 1. Banco de dados

Crie o banco no MySQL antes de subir o backend:

```sql
CREATE DATABASE smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Terminal 1 — Backend

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Instale as dependências
pip install -r requirements.txt

# Aplique as migrações
python manage.py migrate

# Suba o servidor
python manage.py runserver
```

- API: `http://127.0.0.1:8000/api/`
- Admin Django: `http://127.0.0.1:8000/admin/`

### 3. Terminal 2 — Frontend

```bash
cd frontend/integrador

npm install
npm run dev
```

- Interface: `http://127.0.0.1:5173`

---

## Variáveis de ambiente

Por padrão o frontend aponta para `http://127.0.0.1:8000`. Para alterar, crie um `.env` em `frontend/integrador/`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/token` | Obter access + refresh token |
| POST | `/api/refresh` | Renovar access token |
| POST | `/api/register/` | Cadastrar novo usuário |
| POST | `/api/importacao/csv/` | Importar dados via CSV |
| CRUD | `/api/usuarios/` | Gerenciar usuários |
| CRUD | `/api/locais/` | Gerenciar locais |
| CRUD | `/api/responsaveis/` | Gerenciar responsáveis |
| CRUD | `/api/ambientes/` | Gerenciar ambientes |
| CRUD | `/api/microcontroladores/` | Gerenciar microcontroladores |
| CRUD | `/api/sensores/` | Gerenciar sensores |
| CRUD | `/api/historicos/` | Consultar histórico de leituras |

> Todos os endpoints (exceto `/token`, `/refresh` e `/register/`) exigem autenticação via `Authorization: Bearer <token>`.

---

## Configuração do banco (desenvolvimento)

As configurações padrão em `backend/smartcity/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smart',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

Altere conforme seu ambiente local.

---

## Scripts úteis (frontend)

Execute a partir de `frontend/integrador/`:

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | Executa o ESLint |

---

## Solução de problemas

| Erro | Causa provável |
|------|---------------|
| `manage.py not found` | Você não está dentro de `backend/` |
| `package.json not found` | Você não está dentro de `frontend/integrador/` |
| Erro de conexão com banco | MySQL não está ativo ou as credenciais não batem com o `settings.py` |
| `ModuleNotFoundError` | `pip install -r requirements.txt` não foi executado |
