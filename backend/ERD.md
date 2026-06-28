# Entity Relationship Diagram

## Полная схема связей

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                    USERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                    UUID                                             │
│ yandex_id                  VARCHAR(255) UNIQUE                              │
│ email                      VARCHAR(255)                                     │
│ name                       VARCHAR(255)                                     │
│ avatar_url                 TEXT                                             │
│ created_at                 TIMESTAMP                                        │
│ updated_at                 TIMESTAMP                                        │
└────────────────┬────────────────────────────────────────────────────────────┘
                 │
                 │ 1:N
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┬──────────────┐
    │            │            │              │              │              │
    │            │            │              │              │              │
    ▼            ▼            ▼              ▼              ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ACCOUNTS│ │CATEGORIES│ │  BUDGET  │ │  GOALS   │ │ RECURRING│ │   SESSIONS   │
└────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
    │            │            │              │              │
    │            │            │              │              │
    │ 1:N        │ 1:N        │              │              │
    │            │            │              │              │
    ▼            ▼            │              │              │
┌──────────────────┐          │              │              │
│  TRANSACTIONS    │          │              │              │
└──────────────────┘          │              │              │
                              │              │              │
                              ▼              ▼              ▼
                     ┌──────────────┐ ┌──────────┐ ┌──────────────┐
                     │CATEGORY_LIMIT│ │   TOPUPS │ │ TRANSACTIONS │
                     └──────────────┘ └──────────┘ └──────────────┘
```

---

## Детальные связи

### users → accounts (1:N)
```
Один пользователь имеет много счетов
При удалении пользователя → удаляются все счета (CASCADE)
```

### users → categories (1:N)
```
Один пользователь имеет много категорий
Базовые категории имеют user_id = NULL
При удалении пользователя → удаляются его категории (CASCADE)
```

### users → transactions (1:N)
```
Один пользователь имеет много транзакций
При удалении пользователя → удаляются все транзакции (CASCADE)
```

### users → monthly_budgets (1:N)
```
Один пользователь имеет много месячных бюджетов (по одному на месяц)
UNIQUE(user_id, month)
При удалении пользователя → удаляются бюджеты (CASCADE)
```

### users → category_limits (1:N)
```
Один пользователь имеет много лимитов по категориям
UNIQUE(user_id, category_id, month)
При удалении пользователя → удаляются лимиты (CASCADE)
```

### users → savings_goals (1:N)
```
Один пользователь имеет много целей накопления
При удалении пользователя → удаляются цели (CASCADE)
```

### users → recurring_payments (1:N)
```
Один пользователь имеет много регулярных платежей
При удалении пользователя → удаляются платежи (CASCADE)
```

---

### accounts → transactions (1:N)
```
Один счет имеет много транзакций
account_id — источник средств
to_account_id — получатель средств (для transfer)
При удалении счета → удаляются транзакции (CASCADE)
```

### categories → transactions (1:N)
```
Одна категория имеет много транзакций
При удалении категории → транзакции НЕ удаляются (RESTRICT)
Нельзя удалить категорию, если есть связанные транзакции
```

### categories → category_limits (1:N)
```
Одна категория имеет много лимитов (по месяцам)
При удалении категории → удаляются лимиты (CASCADE)
```

### categories → recurring_payments (1:N)
```
Одна категория имеет много регулярных платежей
При удалении категории → платежи НЕ удаляются (RESTRICT)
```

---

### recurring_payments → transactions (1:N)
```
Один регулярный платеж генерирует много транзакций
transactions.recurring_id ссылается на recurring_payments.id
При удалении регулярного платежа → recurring_id становится NULL (SET NULL)
```

---

### savings_goals (самостоятельная)
```
Цели накопления не связаны напрямую с транзакциями
Пополнение цели происходит через отдельную операцию topup
При пополнении:
1. Создается транзакция (расход со счета)
2. Увеличивается current_amount в savings_goal
```

---

## Типы данных и ограничения

### ENUM значения (через CHECK)

**accounts.type:**
- 'cash' — наличные
- 'card' — карта
- 'deposit' — накопительный счет

**accounts.currency:**
- 'RUB' — рубли
- 'USD' — доллары
- 'EUR' — евро

**categories.type:**
- 'income' — доход
- 'expense' — расход

**transactions.type:**
- 'income' — доход
- 'expense' — расход
- 'transfer' — перевод

**recurring_payments.periodicity:**
- 'daily' — ежедневно
- 'weekly' — еженедельно
- 'monthly' — ежемесячно

**savings_goals.status:**
- 'active' — активна
- 'completed' — достигнута
- 'failed' — просрочена

---

## Форматы данных

### Месяц (month)
```
Формат: 'YYYY-MM'
Пример: '2024-01'
Проверка: CHECK (month ~ '^\d{4}-\d{2}$')
```

### Цвет (color)
```
Формат: HEX '#RRGGBB'
Пример: '#FF5733'
Длина: 7 символов
```

### Суммы (amount, balance, limit)
```
Тип: DECIMAL(15, 2)
Диапазон: -999,999,999,999.99 до 999,999,999,999.99
Ограничение: CHECK (amount > 0) для положительных значений
```

### Даты (date, created_at, updated_at)
```
Тип: TIMESTAMP WITH TIME ZONE
Часовая зона: UTC
```

---

## Индексы и производительность

### Покрывающие индексы
```sql
-- Частый запрос: активные счета пользователя
CREATE INDEX idx_accounts_user_id_not_archived 
ON accounts(user_id) WHERE is_archived = false;

-- Частый запрос: ближайшие регулярные платежи
CREATE INDEX idx_recurring_payments_next_date 
ON recurring_payments(next_date) WHERE is_active = true;
```

### Составные индексы
```sql
-- Запросы с фильтрацией по пользователю и дате
CREATE INDEX idx_transactions_user_id_date 
ON transactions(user_id, date DESC);

-- Запросы с фильтрацией по пользователю и месяцу
CREATE INDEX idx_transactions_user_id_month 
ON transactions(user_id, date_trunc('month', date));
```

---

## Сценарии использования

### Сценарий 1: Создание расхода
```
1. Проверить существование accounts по account_id
2. Проверить balance >= amount
3. Создать запись в transactions
4. Обновить accounts.balance (уменьшить на amount)
5. Обновить category_limits.spent (увеличить на amount)
6. Обновить monthly_budgets.actual_amount (увеличить на amount)
```

### Сценарий 2: Создание перевода
```
1. Проверить существование accounts по account_id и to_account_id
2. Проверить balance >= amount на счете-источнике
3. Создать запись в transactions (type = 'transfer')
4. Обновить accounts.balance источника (уменьшить на amount)
5. Обновить accounts.balance получателя (увеличить на amount)
```

### Сценарий 3: Пополнение цели
```
1. Проверить существование accounts по account_id
2. Проверить balance >= amount
3. Создать запись в transactions (расход со счета)
4. Обновить accounts.balance (уменьшить на amount)
5. Обновить savings_goals.current_amount (увеличить на amount)
6. Проверить текущий статус цели (completed, если достигнута)
```

### Сценарий 4: Генерация регулярных платежей
```
1. Найти все recurring_payments где next_date <= NOW() и is_active = true
2. Для каждого платежа:
   a. Создать транзакцию на основе платежа
   b. Обновить балансы счетов
   c. Вычислить следующий next_date
   d. Обновить recurring_payments.next_date
```

---

## Безопасность и целостность данных

### Внешние ключи
- Все связи строго типизированы через FOREIGN KEY
- Каскадное удаление для пользовательских данных
- RESTRICT для важных связей (категории → транзакции)

### Транзакции
- Все операции изменения балансов выполняются в транзакциях
- Изоляция: READ COMMITTED или SERIALIZABLE для финансовых операций

### Валидация
- CHECK constraints для валидации данных на уровне БД
- NOT NULL для обязательных полей
- UNIQUE для уникальных бизнес-ключей
