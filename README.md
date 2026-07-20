# CoinKeeper — Трекер личных финансов

Веб-приложение для учёта доходов и расходов с бюджетированием, аналитикой и целями накоплений.

## 🚀 Быстрый старт

### 1. Установка Docker

Если Docker не установлен:
- Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/
- Установите и запустите Docker Desktop
- Дождитесь, пока иконка кита в меню-баре станет стабильной

### 2. Клонирование репозитория

```bash
git clone https://github.com/Fedorovgood7/Coin_Keepeer.git
cd Coin_Keepeer
```

### 3. Настройка переменных окружения

Скопируйте пример файла окружения:

```bash
cp .env.example .env
```

Откройте `.env` и настройте переменные (подробности ниже).

### 4. Запуск приложения

```bash
docker-compose up -d
```

Эта команда запустит:
- **PostgreSQL** на порту 5432
- **Backend API** на порту 8080
- **Frontend** на порту 3000

### 5. Открытие приложения

Откройте браузер и перейдите по адресу: **http://localhost:3000**

Нажмите "Войти через Yandex ID" для входа.

---

## 🔐 Получение ключей Yandex OAuth

### Шаг 1: Регистрация приложения

1. Перейдите на https://oauth.yandex.ru/client/new
2. Войдите в свой аккаунт Яндекса
3. Нажмите "Зарегистрировать новое приложение"

### Шаг 2: Настройка приложения

1. **Название**: CoinKeeper
2. **Платформы**: выберите "Веб-сервисы"
3. **Redirect URI**: `http://localhost:3000/api/v1/auth/yandex/callback`
4. **Доступы** (в разделе "Яндекс ID"):
   - ✅ `login:email` — получение email
   - ✅ `login:info` — получение имени, аватара
   - ✅ `login:avatar` — получение аватара
5. Нажмите "Зарегистрировать приложение"

### Шаг 3: Получение ключей

После регистрации вы увидите:
- **ID приложения** — это `YANDEX_CLIENT_ID`
- **Пароль приложения** — это `YANDEX_CLIENT_SECRET`

Скопируйте эти значения в файл `.env`.

### Шаг 4: Настройка .env

Откройте `.env` и замените значения:

```env
YANDEX_CLIENT_ID=ваш-id-приложения
YANDEX_CLIENT_SECRET=ваш-пароль-приложения
YANDEX_REDIRECT_URI=http://localhost:3000/api/v1/auth/yandex/callback
JWT_SECRET=случайная-строка-для-jwt
```

Для генерации JWT secret можно использовать:
```bash
openssl rand -base64 32
```

---

## 🛠 Локальная разработка

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:3000

### Backend

```bash
cd backend
go mod download
go run ./cmd/app
```

API будет доступно на http://localhost:8080

### PostgreSQL

```bash
docker-compose up -d postgres
```

База данных будет доступна на localhost:5432

---

## 📱 Функциональность

### Основные возможности

- **Авторизация** через Yandex ID
- **Счета** — управление несколькими счетами (наличные, карты, накопительные)
- **Категории** — настраиваемые категории доходов и расходов с иконками и цветами
- **Операции** — добавление, редактирование и удаление транзакций
- **Бюджет** — установка лимитов по категориям, отслеживание расходов
- **Цели накоплений** — создание целей и отслеживание прогресса
- **Аналитика** — графики расходов по дням и категориям
- **Регулярные платежи** — планирование повторяющихся операций

### MVP функции

1. ✅ Вход через Yandex ID
2. ✅ Создание и управление счетами
3. ✅ Категории расходов и доходов
4. ✅ Добавление операций (доход/расход/перевод)
5. ✅ Фильтры по периоду, счету и категории
6. ✅ Месячный бюджет с лимитами
7. ✅ Дашборд с общей статистикой
8. ✅ Аналитика расходов
9. ✅ Цели накоплений
10. ✅ Экспорт операций в CSV

---

## 🛠 Технологический стек

### Frontend
- **React 18** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Zustand** — управление состоянием
- **React Router** — маршрутизация

### Backend
- **Go** — язык программирования
- **PostgreSQL** — база данных
- **JWT** — аутентификация
- **Clean Architecture** — архитектура приложения

### Инфраструктура
- **Docker** — контейнеризация
- **Docker Compose** — оркестрация
- **Nginx** — веб-сервер для frontend

---

## 📊 API Endpoints

### Авторизация
- `POST /api/v1/auth/yandex` — вход через Yandex ID
- `GET /api/v1/auth/me` — получить профиль
- `POST /api/v1/auth/logout` — выход

### Счета
- `GET /api/v1/accounts` — список счетов
- `POST /api/v1/accounts` — создать счёт
- `PATCH /api/v1/accounts/{id}` — обновить счёт
- `PATCH /api/v1/accounts/{id}/archive` — архивировать счёт

### Категории
- `GET /api/v1/categories` — список категорий
- `POST /api/v1/categories` — создать категорию
- `PATCH /api/v1/categories/{id}` — обновить категорию

### Операции
- `GET /api/v1/transactions` — список операций
- `POST /api/v1/transactions` — создать операцию
- `PATCH /api/v1/transactions/{id}` — обновить операцию
- `DELETE /api/v1/transactions/{id}` — удалить операцию

### Бюджет
- `GET /api/v1/budget/monthly` — месячный бюджет
- `POST /api/v1/budget/category-limit` — установить лимит

### Аналитика
- `GET /api/v1/analytics/categories` — расходы по категориям
- `GET /api/v1/analytics/daily` — расходы по дням

### Цели
- `GET /api/v1/goals` — список целей
- `POST /api/v1/goals` — создать цель
- `POST /api/v1/goals/{id}/topup` — пополнить цель

### Экспорт
- `GET /api/v1/export/csv` — экспорт операций в CSV

---

##  Тестирование

### Frontend

```bash
cd frontend
npm run build      # Сборка для production
npm run preview    # Предпросмотр production сборки
```

### Backend

```bash
cd backend
go test ./...      # Запуск всех тестов
```

---

##  Устранение неполадок

### Порт 3000 уже занят

```bash
lsof -ti:3000 | xargs kill -9
docker-compose up -d
```

### Ошибка подключения к базе данных

```bash
docker-compose ps
docker-compose restart postgres
```

### Ошибка сборки frontend

```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Пересоздание базы данных

```bash
docker-compose down
docker volume rm coinkeeper_postgres_data
docker-compose up -d
```

---

## 📄 Лицензия

MIT
