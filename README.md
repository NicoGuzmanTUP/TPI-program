# Food Store

Aplicación web de pedidos de comida: catálogo con carrito, checkout, seguimiento de pedidos y panel de administración.

- **Backend:** FastAPI + SQLModel + PostgreSQL (`backend/`).
- **Frontend:** React + TypeScript + Vite + Tailwind (`frontend/`).

## Enlaces de entrega

- Repositorio: https://github.com/NicoGuzmanTUP/TPI-program
- Video de demostración: [ver en SharePoint](https://leautneduar-my.sharepoint.com/:v:/g/personal/facundo_guzman_tupad_utn_edu_ar/IQCTxXahf3_zTKcDeKMi-h1bAVuXAt-MIBAy2EnSQ14Ay1g?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=cwO1dF)

> **Importante:** el enlace del video vence el **26 de noviembre de 2026**.

## Requisitos

- Python 3.11 a 3.13 (SQLModel no funciona con Python 3.14)
- Node.js 22 o superior
- pnpm 9 o superior
- Docker y Docker Compose (para PostgreSQL)

## Backend

Desde `backend/`:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # si todavía no existe .env
docker compose up -d        # PostgreSQL en el puerto 5433 (contenedor foodstore_db)
python -m app.db.seed       # crea datos de ejemplo y el usuario admin
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1` y la documentación interactiva en `http://localhost:8000/docs`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL (por defecto `postgresql://foodstore:foodstore@localhost:5433/foodstore_db`) |
| `SECRET_KEY` | Clave para firmar los tokens (mínimo 32 caracteres; cambiarla) |
| `ALGORITHM` | Algoritmo del token (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (`http://localhost:5173`) |

## Frontend

Desde `frontend/`:

```bash
pnpm install
cp .env.example .env
pnpm build                  # verifica tipos y genera dist/
pnpm dev                    # servidor de desarrollo en el puerto 5173
```

Abrir la aplicación en **`http://localhost:5173`** (no usar `127.0.0.1`: CORS y la cookie de sesión no funcionarían).

### Variables de entorno (`frontend/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (`http://localhost:8000/api/v1`) |

## Usuario administrador

El seed crea el usuario:

- Usuario: `admin`
- Contraseña: `Admin1234!`

Cualquier otro usuario se crea desde la pantalla de registro y tiene el rol `user`.

Para ingresar se puede usar el nombre de usuario o el email.
