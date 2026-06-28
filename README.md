# CoinKeeper

Приложение для учета личных финансов.

## Структура проекта

```
CoinKeeper/
├── backend/          # Backend на Go (Clean Architecture)
├── docker-compose.yml
├── .env.example      # Пример переменных окружения
└── README.md
```

## Быстрый старт

### 1. Настройка окружения

```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Отредактируйте .env и укажите ваши Yandex OAuth credentials
nano .env
```

### 2. Запуск через Docker Compose

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f backend
```

Приложение будет доступно на http://localhost:8080

### 3. Применение миграций

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U postgres -d coinkeeper

# Применить миграции (внутри psql)
\i /migrations/001_init_schema.up.sql
\i /migrations/002_seed_data.up.sql
```

### 4. Проверка работы

```bash
# Health check
curl http://localhost:8080/api/v1/health
```

## Backend

Backend построен по принципам Clean Architecture:

```
backend/
├── cmd/app/                    # Точка входа
├── internal/
│   ├── domain/                 # Domain Layer
│   │   ├── entity/             # Бизнес-сущности
│   │   ├── repository/         # Интерфейсы репозиториев
│   │   └── service/            # Интерфейсы сервисов
│   ├── application/            # Application Layer
│   │   ├── dto/                # Data Transfer Objects
│   │   └── usecase/            # Use Cases
│   ├── infrastructure/         # Infrastructure Layer
│   │   ├── postgres/           # PostgreSQL репозитории
│   │   ├── yandex/             # Yandex OAuth клиент
│   │   ├── session/            # JWT сессии
│   │   └── config/             # Конфигурация
│   └── presentation/           # Presentation Layer
│       └── http/               # HTTP handlers, router, middleware
└── migrations/                 # SQL миграции
```

### Технологии

- Go 1.21+
- PostgreSQL 15
- gorilla/mux (HTTP роутер)
- golang-jwt/jwt (JWT токены)
- lib/pq (PostgreSQL драйвер)

### API Endpoints

#### Авторизация
- `POST /api/v1/auth/yandex` - вход через Yandex ID
- `GET /api/v1/auth/me` - получить профиль
- `POST /api/v1/auth/logout` - выход

#### Счета
- `POST /api/v1/accounts` - создать счет
- `GET /api/v1/accounts` - список счетов
- `PATCH /api/v1/accounts/{id}` - обновить счет
- `PATCH /api/v1/accounts/{id}/archive` - архивировать счет

#### Категории
- `GET /api/v1/categories` - список категорий
- `PATCH /api/v1/categories/{id}` - обновить категорию

#### Операции
- `POST /api/v1/transactions` - создать операцию
- `GET /api/v1/transactions` - список операций
- `PATCH /api/v1/transactions/{id}` - обновить операцию
- `DELETE /api/v1/transactions/{id}` - удалить операцию

#### Бюджет
- `GET /api/v1/budget/monthly` - месячный бюджет
- `POST /api/v1/budget/category-limit` - установить лимит
- `GET /api/v1/budget/safe-daily-amount` - безопасная сумма в день

#### Дашборд
- `GET /api/v1/dashboard` - данные дашборда

#### Аналитика
- `GET /api/v1/analytics/categories` - расходы по категориям
- `GET /api/v1/analytics/daily` - расходы по дням
- `GET /api/v1/analytics/comparison` - сравнение доходов и расходов

#### Регулярные платежи
- `POST /api/v1/recurring` - создать регулярный платеж
- `GET /api/v1/recurring` - список регулярных платежей
- `POST /api/v1/recurring/generate` - сгенерировать транзакции

#### Цели накопления
- `POST /api/v1/goals` - создать цель
- `GET /api/v1/goals` - список целей
- `POST /api/v1/goals/{id}/topup` - пополнить цель

#### Экспорт
- `GET /api/v1/export/csv` - экспорт в CSV

### Локальная разработка

```bash
cd backend

# Установить зависимости
go mod download

# Запустить приложение
go run ./cmd/app

# Сборка
go build ./cmd/app
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
| `JWT_SECRET` | Секретный ключ JWT | - |
| `JWT_TOKEN_DURATION_HOURS` | Время жизни токена (часы) | `24` |
| `YANDEX_CLIENT_ID` | Yandex OAuth Client ID | - |
| `YANDEX_CLIENT_SECRET` | Yandex OAuth Client Secret | - |
| `YANDEX_REDIRECT_URI` | Redirect URI для OAuth | - |

## Документация

- [Backend STATUS](./backend/STATUS.md) - статус разработки backend
- [Backend DB_SCHEMA](./backend/DB_SCHEMA.md) - схема базы данных
- [Backend ERD](./backend/ERD.md) - диаграмма связей

## Лицензия

MIT
