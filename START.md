# CoinKeeper — Инструкция по запуску

## Что нужно для запуска

### 1. Docker Desktop
- **Скачать**: https://www.docker.com/products/docker-desktop/
- **Установить** и запустить
- **Проверить**: `docker --version` должен показать версию

### 2. Git (опционально)
- Для клонирования репозитория
- **Скачать**: https://git-scm.com/

---

## Пошаговый запуск

### Шаг 1: Клонировать проект

```bash
git clone https://github.com/Fedorovgood7/Coin_Keepeer.git
cd Coin_Keepeer
```

### Шаг 2: Настроить переменные окружения

```bash
cp .env.example .env
```

Откройте `.env` и настройте (подробности ниже).

### Шаг 3: Запустить

```bash
docker-compose up -d
```

### Шаг 4: Открыть приложение

**http://localhost:3000**

---

## Получение ключей Yandex OAuth

### 1. Перейдите на страницу регистрации приложения

**https://oauth.yandex.ru/client/new**

### 2. Заполните форму

- **Название**: CoinKeeper
- **Платформы**: Веб-сервисы
- **Redirect URI**: `http://localhost:3000/api/v1/auth/yandex/callback`

### 3. Выберите доступы

В разделе "Яндекс ID" отметьте:
- ✅ `login:email`
- ✅ `login:info`
- ✅ `login:avatar`

### 4. Сохраните ключи

После регистрации скопируйте:
- **ID приложения** → `YANDEX_CLIENT_ID`
- **Пароль приложения** → `YANDEX_CLIENT_SECRET`

### 5. Настройте .env

```env
YANDEX_CLIENT_ID=ваш-id-приложения
YANDEX_CLIENT_SECRET=ваш-пароль-приложения
YANDEX_REDIRECT_URI=http://localhost:3000/api/v1/auth/yandex/callback
JWT_SECRET=любая-случайная-строка
```

Для генерации JWT secret:
```bash
openssl rand -base64 32
```

---

## Демо-режим (без Yandex ID)

Если не хотите настраивать OAuth, оставьте значения по умолчанию в `.env`:

```env
YANDEX_CLIENT_ID=demo-client-id
YANDEX_CLIENT_SECRET=demo-client-secret
```

Приложение будет работать в демо-режиме с тестовыми данными.

---

## Проверка работы

### Все сервисы запущены?

```bash
docker-compose ps
```

Должны быть 3 контейнера в статусе "Up":
- coinkeeper-postgres-1
- coinkeeper-backend-1
- coinkeeper-frontend-1

### Backend работает?

```bash
curl http://localhost:8080/api/v1/health
```

Должен вернуть: `{"status":"ok"}`

### Frontend работает?

Откройте **http://localhost:3000** в браузере.

---

## Остановка приложения

```bash
docker-compose down
```

### С удалением данных

```bash
docker-compose down
docker volume rm coinkeeper_postgres_data
```

---

## Локальная разработка

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
go mod download
go run ./cmd/app
```

---

## Структура проекта

```
CoinKeeper/
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── pages/     # Страницы
│   │   ├── store/     # Zustand
│   │   └── types/     # TypeScript типы
│   └── Dockerfile
├── backend/           # Go + PostgreSQL
│   ├── cmd/app/       # Точка входа
│   ├── internal/      # Clean Architecture
│   └── migrations/    # SQL миграции
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Устранение неполадок

### Порт 3000 занят

```bash
lsof -ti:3000 | xargs kill -9
docker-compose up -d
```

### Ошибка базы данных

```bash
docker-compose restart postgres
```

### Пересоздание БД

```bash
docker-compose down
docker volume rm coinkeeper_postgres_data
docker-compose up -d
```

---

## Готово! 🎉

Приложение запущено и доступно по адресу **http://localhost:3000**
