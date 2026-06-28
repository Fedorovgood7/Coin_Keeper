# Статус разработки Backend

## Выполнено

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

### Database (100%)

#### Миграции (3 файла)
- [x] `001_init_schema.up.sql` — создание всех таблиц с индексами и триггерами
- [x] `001_init_schema.down.sql` — откат миграции
- [x] `002_seed_data.up.sql` — демо-данные для тестирования

#### Документация (2 файла)
- [x] `DB_SCHEMA.md` — полное описание схемы БД
- [x] `ERD.md` — диаграмма связей и сценарии использования

---

## Не выполнено

### Infrastructure Layer

#### PostgreSQL Repositories (7 файлов)
- [ ] `user_repository.go` — реализация UserRepository
- [ ] `account_repository.go` — реализация AccountRepository
- [ ] `category_repository.go` — реализация CategoryRepository
- [ ] `transaction_repository.go` — реализация TransactionRepository
- [ ] `budget_repository.go` — реализация BudgetRepository
- [ ] `goal_repository.go` — реализация GoalRepository
- [ ] `recurring_repository.go` — реализация RecurringRepository

#### External Services (2 файла)
- [ ] `yandex/oauth_client.go` — реализация OAuthService для Yandex ID
- [ ] `session/jwt_service.go` — реализация SessionService с JWT

#### Scheduler (2 файла)
- [ ] `scheduler/scheduler.go` — планировщик задач
- [ ] `scheduler/recurring_job.go` — задача генерации регулярных платежей

#### Config (1 файл)
- [ ] `config/config.go` — загрузка конфигурации из env

---

### Presentation Layer

#### HTTP Handlers (10 файлов)
- [ ] `auth_handler.go` — обработчики авторизации
- [ ] `account_handler.go` — обработчики счетов
- [ ] `category_handler.go` — обработчики категорий
- [ ] `transaction_handler.go` — обработчики транзакций
- [ ] `budget_handler.go` — обработчики бюджетов
- [ ] `dashboard_handler.go` — обработчики дашборда
- [ ] `analytics_handler.go` — обработчики аналитики
- [ ] `recurring_handler.go` — обработчики регулярных платежей
- [ ] `goal_handler.go` — обработчики целей
- [ ] `export_handler.go` — обработчики экспорта

#### Router (1 файл)
- [ ] `router.go` — маршрутизация HTTP запросов

#### Middleware (4 файла)
- [ ] `auth.go` — middleware для проверки авторизации
- [ ] `logger.go` — middleware для логирования
- [ ] `cors.go` — middleware для CORS
- [ ] `recovery.go` — middleware для обработки паник

#### Response Helpers (2 файла)
- [ ] `success.go` — хелперы для успешных ответов
- [ ] `error.go` — хелперы для ошибок

#### Swagger (2 файла)
- [ ] `swagger.yaml` — OpenAPI спецификация
- [ ] `docs/` — документация Swagger UI

---

### Application Entry Point

#### Main (1 файл)
- [ ] `cmd/app/main.go` — точка входа, dependency injection

---

### Tests

#### Unit Tests (7 файлов)
- [ ] `usecase/account/account_test.go`
- [ ] `usecase/transaction/transaction_test.go`
- [ ] `usecase/budget/budget_test.go`
- [ ] `usecase/goal/goal_test.go`
- [ ] `usecase/recurring/recurring_test.go`
- [ ] `entity/account_test.go`
- [ ] `entity/goal_test.go`

#### Integration Tests (1 файл)
- [ ] `tests/api/api_test.go` — API тесты

---

### Docker (2 файла)
- [ ] `Dockerfile` — образ backend приложения
- [ ] `docker-compose.yml` — локальный запуск (backend + postgres)

---

## Следующие шаги

### Приоритет 1: Infrastructure Layer
1. Реализовать PostgreSQL repositories
2. Реализовать JWT session service
3. Реализовать Yandex OAuth client
4. Настроить конфигурацию

### Приоритет 2: Presentation Layer
1. Реализовать HTTP handlers
2. Настроить router
3. Добавить middleware
4. Реализовать response helpers

### Приоритет 3: Application Entry Point
1. Создать main.go с dependency injection
2. Настроить graceful shutdown

### Приоритет 4: Tests
1. Написать unit тесты для use cases
2. Написать API тесты
3. Настроить CI/CD

### Приоритет 5: Docker
1. Создать Dockerfile
2. Создать docker-compose.yml
3. Протестировать локальный запуск

---

## Оценка прогресса

| Слой | Выполнено | Всего | Прогресс |
|------|-----------|-------|----------|
| Domain Layer | 17 | 17 | 100% |
| Application Layer | 30 | 30 | 100% |
| Database | 5 | 5 | 100% |
| Infrastructure Layer | 0 | 12 | 0% |
| Presentation Layer | 0 | 19 | 0% |
| Entry Point | 0 | 1 | 0% |
| Tests | 0 | 8 | 0% |
| Docker | 0 | 2 | 0% |
| **ИТОГО** | **52** | **94** | **55%** |
