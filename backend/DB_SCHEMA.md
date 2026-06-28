# Схема базы данных PostgreSQL

## Обзор таблиц

### 1. users
Пользователи системы, связанные с Yandex ID.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| yandex_id | VARCHAR(255) | Уникальный ID из Yandex ID |
| email | VARCHAR(255) | Email пользователя |
| name | VARCHAR(255) | Имя пользователя |
| avatar_url | TEXT | URL аватара |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

---

### 2. accounts
Счета пользователя (карты, наличные, накопительные).

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец счета (FK → users) |
| name | VARCHAR(100) | Название счета |
| type | VARCHAR(20) | Тип: cash, card, deposit |
| currency | VARCHAR(3) | Валюта: RUB, USD, EUR |
| balance | DECIMAL(15,2) | Текущий баланс |
| initial_balance | DECIMAL(15,2) | Начальный баланс |
| is_archived | BOOLEAN | Архивный счет |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Индексы:**
- `idx_accounts_user_id` — поиск по пользователю
- `idx_accounts_user_id_not_archived` — активные счета пользователя

---

### 3. categories
Категории доходов и расходов.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (NULL для базовых категорий) |
| name | VARCHAR(100) | Название категории |
| type | VARCHAR(20) | Тип: income, expense |
| color | VARCHAR(7) | HEX цвет (#RRGGBB) |
| icon | VARCHAR(50) | Иконка |
| is_default | BOOLEAN | Базовая категория |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Ограничения:**
- Либо user_id IS NOT NULL (пользовательская), либо is_default = true (базовая)

**Индексы:**
- `idx_categories_user_id` — категории пользователя
- `idx_categories_default` — базовые категории

---

### 4. transactions
Операции: доходы, расходы, переводы.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (FK → users) |
| type | VARCHAR(20) | Тип: income, expense, transfer |
| amount | DECIMAL(15,2) | Сумма (> 0) |
| account_id | UUID | Счет операции (FK → accounts) |
| to_account_id | UUID | Целевой счет для transfer (FK → accounts) |
| category_id | UUID | Категория (FK → categories) |
| date | TIMESTAMP | Дата операции |
| comment | TEXT | Комментарий |
| recurring_id | UUID | Связь с регулярным платежом (FK → recurring_payments) |
| created_at | TIMESTAMP | Дата создания |

**Индексы:**
- `idx_transactions_user_id` — операции пользователя
- `idx_transactions_user_id_date` — операции по дате
- `idx_transactions_account_id` — операции по счету
- `idx_transactions_category_id` — операции по категории
- `idx_transactions_user_id_month` — операции по месяцу
- `idx_transactions_recurring_id` — операции от регулярного платежа

---

### 5. monthly_budgets
Месячные бюджеты пользователей.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (FK → users) |
| month | VARCHAR(7) | Месяц в формате YYYY-MM |
| planned_amount | DECIMAL(15,2) | Плановая сумма расходов |
| actual_amount | DECIMAL(15,2) | Фактические расходы |
| safe_daily_amount | DECIMAL(15,2) | Безопасная сумма в день |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Ограничения:**
- UNIQUE(user_id, month) — один бюджет на месяц

**Индексы:**
- `idx_monthly_budgets_user_id` — бюджеты пользователя
- `idx_monthly_budgets_user_month` — бюджет за конкретный месяц

---

### 6. category_limits
Лимиты расходов по категориям.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (FK → users) |
| category_id | UUID | Категория (FK → categories) |
| month | VARCHAR(7) | Месяц в формате YYYY-MM |
| limit | DECIMAL(15,2) | Лимит (> 0) |
| spent | DECIMAL(15,2) | Потрачено |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Ограничения:**
- UNIQUE(user_id, category_id, month) — один лимит на категорию в месяц

**Индексы:**
- `idx_category_limits_user_id` — лимиты пользователя
- `idx_category_limits_user_month` — лимиты за месяц
- `idx_category_limits_category_id` — лимиты по категории

---

### 7. savings_goals
Цели накопления.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (FK → users) |
| title | VARCHAR(200) | Название цели |
| target_amount | DECIMAL(15,2) | Целевая сумма (> 0) |
| current_amount | DECIMAL(15,2) | Текущая накопленная сумма |
| deadline | TIMESTAMP | Дедлайн |
| status | VARCHAR(20) | Статус: active, completed, failed |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Индексы:**
- `idx_savings_goals_user_id` — цели пользователя
- `idx_savings_goals_user_status` — цели по статусу

---

### 8. recurring_payments
Регулярные платежи.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Владелец (FK → users) |
| type | VARCHAR(20) | Тип: income, expense, transfer |
| amount | DECIMAL(15,2) | Сумма (> 0) |
| account_id | UUID | Счет (FK → accounts) |
| to_account_id | UUID | Целевой счет для transfer (FK → accounts) |
| category_id | UUID | Категория (FK → categories) |
| periodicity | VARCHAR(20) | Периодичность: daily, weekly, monthly |
| next_date | TIMESTAMP | Дата следующего платежа |
| comment | TEXT | Комментарий |
| is_active | BOOLEAN | Активен ли платеж |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Индексы:**
- `idx_recurring_payments_user_id` — платежи пользователя
- `idx_recurring_payments_next_date` — ближайшие платежи
- `idx_recurring_payments_user_active` — активные платежи пользователя

---

## Диаграмма связей

```
users (1) ──────< (N) accounts
  │                    │
  │                    │
  │                    └──────< (N) transactions
  │                              │
  │                              │
  ├──────< (N) categories ───────┘
  │            │
  │            │
  ├──────< (N) monthly_budgets
  │
  ├──────< (N) category_limits
  │
  ├──────< (N) savings_goals
  │
  └──────< (N) recurring_payments ──< (N) transactions
```

---

## Ключевые особенности

### 1. UUID первичные ключи
- Безопасны для API (не угадываются)
- Генерируются на уровне БД через `gen_random_uuid()`

### 2. Каскадное удаление
- При удалении пользователя удаляются все его данные
- При удалении счета удаляются связанные транзакции
- При удалении категории транзакции НЕ удаляются (ON DELETE RESTRICT)

### 3. CHECK ограничения
- Валидация типов счетов, валют, категорий
- Суммы всегда положительны
- Формат месяца проверяется regex

### 4. Автоматическое обновление updated_at
- Триггеры автоматически обновляют поле updated_at при изменении записи

### 5. Индексы для производительности
- Все внешние ключи проиндексированы
- Составные индексы для частых запросов (user_id + date)
- Частичные индексы для фильтрации (is_archived = false)

---

## Запуск миграций

```bash
# С использованием goose
cd backend
goose postgres "user=postgres password=secret dbname=coinkeeper sslmode=disable" up

# С использованием migrate
migrate -path migrations -database "postgres://postgres:secret@localhost:5432/coinkeeper?sslmode=disable" up
```

---

## Примеры запросов

### Получить все счета пользователя
```sql
SELECT * FROM accounts WHERE user_id = 'user-uuid' AND is_archived = false;
```

### Получить операции за месяц
```sql
SELECT * FROM transactions 
WHERE user_id = 'user-uuid' 
  AND date >= '2024-01-01' 
  AND date < '2024-02-01'
ORDER BY date DESC;
```

### Получить расходы по категориям за месяц
```sql
SELECT c.name, SUM(t.amount) as total
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'user-uuid'
  AND t.type = 'expense'
  AND date_trunc('month', t.date) = '2024-01-01'
GROUP BY c.id, c.name
ORDER BY total DESC;
```

### Получить бюджет на текущий месяц
```sql
SELECT * FROM monthly_budgets 
WHERE user_id = 'user-uuid' 
  AND month = to_char(NOW(), 'YYYY-MM');
```

### Получить ближайшие регулярные платежи
```sql
SELECT * FROM recurring_payments 
WHERE user_id = 'user-uuid' 
  AND is_active = true 
  AND next_date >= NOW()
ORDER BY next_date ASC
LIMIT 5;
```
