# CoinKeeper Backend

Backend приложение для учета личных финансов, построенное по принципам Clean Architecture.

## Технологический стек

- **Go 1.21+**
- **PostgreSQL 15**
- **gorilla/mux** — HTTP роутер
- **golang-jwt/jwt** — JWT токены
- **lib/pq** — PostgreSQL драйвер
- **Docker & Docker Compose** — контейнеризация

## Архитектура

Проект построен по принципам **Clean Architecture** с разделением на слои:

```
backend/
├── cmd/app/                    # Точка входа, DI
├── internal/
│   ├── domain/                 # Domain Layer — ядро
│   │   ├── entity/             # Бизнес-сущности
│   │   ├── repository/         # Интерфейсы репозиториев
│   │   ├── service/            # Интерфейсы внешних сервисов
│   │   └── errors.go           # Доменные ошибки
│   ├── application/            # Application Layer — use cases
│   │   ├── dto/                # Data Transfer Objects
│   │   └── usecase/            # Бизнес-операции
│   ├── infrastructure/         # Infrastructure Layer
│   │   ├── postgres/           # Реализации репозиториев
│   │   ├── yandex/             # Yandex OAuth клиент
│   │   ├── session/            # JWT session service
│   │   └── config/             # Конфигурация
│   └── presentation/           # Presentation Layer
│       └── http/               # HTTP handlers, router, middleware
├── migrations/                 # SQL миграции
├── Dockerfile
├── docker-compose.yml
└── go.mod
```

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repository-url>
cd CoinKeeper/backend
```

### 2. Настроить переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваши Yandex OAuth credentials:

```env
YANDEX_CLIENT_ID=your-client-id
YANDEX_CLIENT_SECRET=your-client-secret
YANDEX_REDIRECT_URI=http://localhost:8080/api/v1/auth/yandex/callback
```

### 3. Запустить через Docker Compose

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Backend API на порту 8080

### 4. Применить миграции

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U postgres -d coinkeeper

# Внутри psql
\i /path/to/migrations/001_init_schema.up.sql
\i /path/to/migrations/002_seed_data.up.sql
```

Или используйте инструмент миграций (goose, migrate).

### 5. Проверить работу

```bash
curl http://localhost:8080/api/v1/health
```

## API Endpoints

### Авторизация
- `POST /api/v1/auth/yandex` — вход через Yandex ID
- `GET /api/v1/auth/me` — получить профиль (требует авторизации)
- `POST /api/v1/auth/logout` — выход

### Счета
- `POST /api/v1/accounts` — создать счет
- `GET /api/v1/accounts` — список счетов
- `PATCH /api/v1/accounts/{id}` — обновить счет
- `PATCH /api/v1/accounts/{id}/archive` — архивировать счет

### Категории
- `GET /api/v1/categories` — список категорий
- `PATCH /api/v1/categories/{id}` — обновить категорию

### Операции
- `POST /api/v1/transactions` — создать операцию
- `GET /api/v1/transactions` — список операций (с фильтрами)
- `PATCH /api/v1/transactions/{id}` — обновить операцию
- `DELETE /api/v1/transactions/{id}` — удалить операцию

### Бюджет
- `GET /api/v1/budget/monthly?month=2024-01` — месячный бюджет
- `POST /api/v1/budget/category-limit` — установить лимит по категории
- `GET /api/v1/budget/safe-daily-amount?month=2024-01` — безопасная сумма в день

### Дашборд
- `GET /api/v1/dashboard` — данные дашборда

### Аналитика
- `GET /api/v1/analytics/categories?month=2024-01` — расходы по категориям
- `GET /api/v1/analytics/daily?month=2024-01` — расходы по дням
- `GET /api/v1/analytics/comparison?month=2024-01` — сравнение доходов и расходов

### Регулярные платежи
- `POST /api/v1/recurring` — создать регулярный платеж
- `GET /api/v1/recurring` — список регулярных платежей
- `POST /api/v1/recurring/generate` — сгенерировать транзакции

### Цели накопления
- `POST /api/v1/goals` — создать цель
- `GET /api/v1/goals` — список целей
- `POST /api/v1/goals/{id}/topup` — пополнить цель

### Экспорт
- `GET /api/v1/export/csv?date_from=...&date_to=...` — экспорт в CSV

## Авторизация

Все endpoints (кроме `/auth/yandex` и `/health`) требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `SERVER_PORT` | Порт сервера | `8080` |
| `SERVER_HOST` | Хост сервера | `0.0.0.0` |
| `DB_HOST` | Хост PostgreSQL | `localhost` |
| `DB_PORT` | Порт PostgreSQL | `5432` |
| `DB_USER` | Пользователь БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | `postgres` |
| `DB_NAME` | Имя базы данных | `coinkeeper` |
| `DB_SSLMODE` | SSL режим | `disable` |
| `JWT_SECRET` | Секретный ключ JWT | — |
| `JWT_TOKEN_DURATION_HOURS` | Время жизни токена (часы) | `24` |
| `YANDEX_CLIENT_ID` | Yandex OAuth Client ID | — |
| `YANDEX_CLIENT_SECRET` | Yandex OAuth Client Secret | — |
| `YANDEX_REDIRECT_URI` | Redirect URI для OAuth | — |

## Разработка

### Запуск без Docker

```bash
# Установить зависимости
go mod download

# Запустить PostgreSQL локально
# ...

# Запустить приложение
go run ./cmd/app
```

### Тестирование

```bash
go test ./...
```

## Структура базы данных

См. [DB_SCHEMA.md](./DB_SCHEMA.md) и [ERD.md](./ERD.md)

## Лицензия

MIT
