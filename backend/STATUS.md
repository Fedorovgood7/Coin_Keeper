# Статус разработки Backend

## Выполнено (100%)

### Domain Layer (100%)

#### Entity (7 файлов)
- [x] `user.go` — сущность пользователя
- [x] `account.go` — сущность счета с методами UpdateBalance, Archive, HasSufficientFunds
- [x] `category.go` — сущность категории с методами UpdateColor, UpdateIcon
- [x] `transaction.go` — сущность транзакции с методами IsTransfer, IsExpense, IsIncome
- [x] `budget.go` — сущности MonthlyBudget и CategoryLimit с бизнес-методами
- [x] `goal.go` — сущность цели накопления с методами Topup, Progress, UpdateStatus
- [x] `recurring.go` — сущность регулярного платежа с методами CalculateNextDate, IsDue

#### Repository Interfaces (7 файлов)
- [x] `user_repository.go` — интерфейс для работы с пользователями
- [x] `account_repository.go` — интерфейс для работы со счетами
- [x] `category_repository.go` — интерфейс для работы с категориями
- [x] `transaction_repository.go` — интерфейс для работы с транзакциями
- [x] `budget_repository.go` — интерфейс для работы с бюджетами
- [x] `goal_repository.go` — интерфейс для работы с целями
- [x] `recurring_repository.go` — интерфейс для работы с регулярными платежами

#### Service Interfaces (2 файла)
- [x] `oauth_service.go` — интерфейс для Yandex OAuth
- [x] `session_service.go` — интерфейс для управления сессиями

#### Domain Errors (1 файл)
- [x] `errors.go` — доменные ошибки (NotFound, Unauthorized, InsufficientFunds, etc.)

---

### Application Layer (100%)

#### DTOs (10 файлов)
- [x] `auth_dto.go` — DTO для авторизации
- [x] `account_dto.go` — DTO для счетов
- [x] `category_dto.go` — DTO для категорий
- [x] `transaction_dto.go` — DTO для транзакций
- [x] `budget_dto.go` — DTO для бюджетов
- [x] `dashboard_dto.go` — DTO для дашборда
- [x] `analytics_dto.go` — DTO для аналитики
- [x] `recurring_dto.go` — DTO для регулярных платежей
- [x] `goal_dto.go` — DTO для целей накопления
- [x] `export_dto.go` — DTO для экспорта

#### Use Cases (20 файлов)

**Auth (2):**
- [x] `login_with_yandex.go` — вход через Yandex ID
- [x] `get_profile.go` — получение профиля

**Account (4):**
- [x] `create_account.go` — создание счета
- [x] `get_accounts.go` — получение списка счетов
- [x] `update_account.go` — обновление счета
- [x] `archive_account.go` — архивирование счета

**Category (2):**
- [x] `get_categories.go` — получение списка категорий
- [x] `update_category.go` — обновление категории

**Transaction (4):**
- [x] `create_transaction.go` — создание транзакции с пересчетом балансов
- [x] `get_transactions.go` — получение списка транзакций с фильтрами
- [x] `update_transaction.go` — обновление транзакции
- [x] `delete_transaction.go` — удаление транзакции с пересчетом балансов

**Budget (3):**
- [x] `get_monthly_budget.go` — получение месячного бюджета с расчетом safe daily amount
- [x] `set_category_limit.go` — установка лимита по категории
- [x] `calculate_safe_daily_amount.go` — расчет безопасной суммы в день

**Dashboard (1):**
- [x] `get_dashboard_data.go` — получение данных для дашборда

**Analytics (3):**
- [x] `get_category_stats.go` — статистика расходов по категориям
- [x] `get_daily_stats.go` — статистика расходов по дням
- [x] `get_income_expense_comparison.go` — сравнение доходов и расходов

**Recurring (3):**
- [x] `create_recurring.go` — создание регулярного платежа
- [x] `get_recurring_payments.go` — получение списка регулярных платежей
- [x] `generate_transactions.go` — генерация транзакций из регулярных платежей

**Goal (3):**
- [x] `create_goal.go` — создание цели накопления
- [x] `get_goals.go` — получение списка целей
- [x] `topup_goal.go` — пополнение цели

**Export (1):**
- [x] `export_transactions_csv.go` — экспорт транзакций в CSV

---

### Infrastructure Layer (100%)

#### PostgreSQL Repositories (7 файлов)
- [x] `user_repository.go` — реализация UserRepository
- [x] `account_repository.go` — реализация AccountRepository
- [x] `category_repository.go` — реализация CategoryRepository
- [x] `transaction_repository.go` — реализация TransactionRepository
- [x] `budget_repository.go` — реализация BudgetRepository
- [x] `goal_repository.go` — реализация GoalRepository
- [x] `recurring_repository.go` — реализация RecurringRepository

#### External Services (2 файла)
- [x] `yandex/oauth_client.go` — реализация OAuthService для Yandex ID
- [x] `session/jwt_service.go` — реализация SessionService с JWT

#### Config (1 файл)
- [x] `config/config.go` — загрузка конфигурации из env

---

### Presentation Layer (100%)

#### HTTP Handlers (10 файлов)
- [x] `auth_handler.go` — обработчики авторизации
- [x] `account_handler.go` — обработчики счетов
- [x] `category_handler.go` — обработчики категорий
- [x] `transaction_handler.go` — обработчики транзакций
- [x] `budget_handler.go` — обработчики бюджетов
- [x] `dashboard_handler.go` — обработчики дашборда
- [x] `analytics_handler.go` — обработчики аналитики
- [x] `recurring_handler.go` — обработчики регулярных платежей
- [x] `goal_handler.go` — обработчики целей
- [x] `export_handler.go` — обработчики экспорта

#### Router (1 файл)
- [x] `router.go` — маршрутизация HTTP запросов (gorilla/mux)

#### Middleware (4 файла)
- [x] `auth.go` — middleware для проверки авторизации
- [x] `logger.go` — middleware для логирования
- [x] `cors.go` — middleware для CORS
- [x] `recovery.go` — middleware для обработки паник

#### Response Helpers (2 файла)
- [x] `success.go` — хелперы для успешных ответов
- [x] `error.go` — хелперы для ошибок

---

### Application Entry Point (100%)

#### Main (1 файл)
- [x] `cmd/app/main.go` — точка входа, dependency injection, graceful shutdown

---

### Database (100%)

#### Миграции (3 файла)
- [x] `001_init_schema.up.sql` — создание всех таблиц с индексами и триггерами
- [x] `001_init_schema.down.sql` — откат миграции
- [x] `002_seed_data.up.sql` — демо-данные для тестирования

#### Документация (2 файла)
- [x] `DB_SCHEMA.md` — полное описание схемы БД
- [x] `ERD.md` — диаграмма связей и сценарии использования

---

### Docker & Infrastructure (100%)

- [x] `Dockerfile` — образ backend приложения
- [x] `docker-compose.yml` — локальный запуск (backend + postgres)
- [x] `.env.example` — пример переменных окружения
- [x] `go.mod` — зависимости Go
- [x] `go.sum` — хеши зависимостей
- [x] `README.md` — документация проекта

---

## Итоговая статистика

| Слой | Файлов | Статус |
|------|--------|--------|
| Domain Layer | 17 | 100% |
| Application Layer | 30 | 100% |
| Infrastructure Layer | 10 | 100% |
| Presentation Layer | 17 | 100% |
| Entry Point | 1 | 100% |
| Database | 5 | 100% |
| Docker & Config | 6 | 100% |
| **ИТОГО** | **86** | **100%** |

---

## REST API Endpoints

### Public
- `POST /api/v1/auth/yandex` — вход через Yandex ID
- `GET /api/v1/health` — health check

### Protected (требуют Authorization: Bearer <token>)

**Auth:**
- `GET /api/v1/auth/me` — получить профиль
- `POST /api/v1/auth/logout` — выход

**Accounts:**
- `POST /api/v1/accounts` — создать счет
- `GET /api/v1/accounts` — список счетов
- `PATCH /api/v1/accounts/{id}` — обновить счет
- `PATCH /api/v1/accounts/{id}/archive` — архивировать счет

**Categories:**
- `GET /api/v1/categories` — список категорий
- `PATCH /api/v1/categories/{id}` — обновить категорию

**Transactions:**
- `POST /api/v1/transactions` — создать операцию
- `GET /api/v1/transactions` — список операций (фильтры: date_from, date_to, account_id, category_id, type)
- `PATCH /api/v1/transactions/{id}` — обновить операцию
- `DELETE /api/v1/transactions/{id}` — удалить операцию

**Budget:**
- `GET /api/v1/budget/monthly?month=YYYY-MM` — месячный бюджет
- `POST /api/v1/budget/category-limit` — установить лимит по категории
- `GET /api/v1/budget/safe-daily-amount?month=YYYY-MM` — безопасная сумма в день

**Dashboard:**
- `GET /api/v1/dashboard` — данные дашборда

**Analytics:**
- `GET /api/v1/analytics/categories?month=YYYY-MM` — расходы по категориям
- `GET /api/v1/analytics/daily?month=YYYY-MM` — расходы по дням
- `GET /api/v1/analytics/comparison?month=YYYY-MM` — сравнение доходов и расходов

**Recurring:**
- `POST /api/v1/recurring` — создать регулярный платеж
- `GET /api/v1/recurring` — список регулярных платежей
- `POST /api/v1/recurring/generate` — сгенерировать транзакции

**Goals:**
- `POST /api/v1/goals` — создать цель
- `GET /api/v1/goals` — список целей
- `POST /api/v1/goals/{id}/topup` — пополнить цель

**Export:**
- `GET /api/v1/export/csv?date_from=...&date_to=...` — экспорт в CSV

---

## Запуск проекта

### Через Docker Compose

```bash
# 1. Скопировать .env.example в .env и заполнить Yandex credentials
cp .env.example .env

# 2. Запустить контейнеры
docker-compose up -d

# 3. Применить миграции (вручную или через инструмент миграций)

# 4. Проверить работу
curl http://localhost:8080/api/v1/health
```

### Локально

```bash
# 1. Установить зависимости
go mod download

# 2. Настроить PostgreSQL и переменные окружения

# 3. Запустить приложение
go run ./cmd/app
```

---

## Следующие шаги (опционально)

- [ ] Unit-тесты для use cases
- [ ] Integration-тесты для API
- [ ] Swagger/OpenAPI документация
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy в Yandex Cloud
