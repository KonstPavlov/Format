# Развёртывание сайта ФОРМАТ на своём сервере

Проект состоит из трёх сервисов, которые запускаются одной командой через Docker:

- **mongo** — база данных (хранит заявки как резерв)
- **backend** — FastAPI (обработка формы заявки, отправка на e-mail через SMTP)
- **frontend** — собранный React-сайт, который отдаёт nginx и проксирует `/api` на backend

---

## 1. Требования

На сервере должны быть установлены:

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) (входит в состав современного Docker: `docker compose`)

---

## 2. Настройка переменных окружения

### backend/.env
Скопируйте пример и заполните SMTP-данные:

```bash
cp backend/.env.example backend/.env
```

Заполните:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — данные вашей почты (например, Яндекс, Gmail, Mail.ru)
- `RECIPIENT_EMAIL` — куда приходят заявки
- `CORS_ORIGINS` — ваш домен, например `https://format-irk.ru` (или `*`)

> Для Яндекс.Почты используйте порт `465` и **пароль приложения**, а не обычный пароль.

### Публичный адрес (домен)
Задайте переменную `PUBLIC_URL` — это адрес, по которому сайт открывается в браузере.
Он «вшивается» в React при сборке и используется для запросов к API.

```bash
export PUBLIC_URL=https://format-irk.ru   # ваш реальный домен
```

Если запускаете локально для проверки — можно оставить `http://localhost`.

---

## 3. Запуск

Из корня проекта:

```bash
docker compose up -d --build
```

- Сайт будет доступен на **80 порту** (`http://ваш-сервер` или ваш домен).
- Заявки с формы уходят на `RECIPIENT_EMAIL` и дублируются в MongoDB.

Проверить логи:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Остановить:

```bash
docker compose down
```

Пересобрать после изменений (например, сменили домен):

```bash
PUBLIC_URL=https://format-irk.ru docker compose up -d --build
```

---

## 4. HTTPS (рекомендуется)

Самый простой способ — поставить перед контейнерами обратный прокси с автоматическим SSL:

**Вариант A — Caddy (авто-Let's Encrypt):**
Пример `Caddyfile`:

```
format-irk.ru {
    reverse_proxy localhost:80
}
```

**Вариант B — Nginx + Certbot** на хосте, проксирующий на `localhost:80`.

После включения HTTPS убедитесь, что `PUBLIC_URL` начинается с `https://`, и пересоберите frontend.

---

## 5. Как заменить контент

Весь контент вынесен в один файл:

```
frontend/src/constants/data.js
```

Там находятся: телефон, цены, услуги, преимущества, этапы, портфолио (фото), отзывы, FAQ.
После изменений пересоберите frontend (`docker compose up -d --build`).

---

## 6. Структура

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .env.example      # шаблон переменных (скопируйте в .env)
│   ├── requirements.txt
│   └── server.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf        # раздача SPA + проксирование /api
    ├── .env.example
    └── src/
```
