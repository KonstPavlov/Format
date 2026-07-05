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

### Развёртывание БЕЗ почты (пока нет почтового сервера)

Можно запустить сайт сразу, **не настраивая SMTP**. Просто оставьте поля
`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` **пустыми** в `backend/.env`
(в шаблоне они уже пустые).

В этом режиме:
- форма заявки работает и показывает «Спасибо! Мы свяжемся с вами...»;
- каждая заявка **пишется в логи** контейнера и (в полном варианте) сохраняется в MongoDB;
- письма не отправляются, ошибок не возникает.

Посмотреть поступившие заявки:

```bash
docker compose logs -f backend | grep "НОВАЯ ЗАЯВКА"
```

Когда появится почтовый ящик — просто впишите SMTP-данные в `backend/.env`
и перезапустите backend:

```bash
docker compose up -d --build backend
```

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

## 3b. Запуск, если код у вас в Git-репозитории

На чистом сервере (Ubuntu/Debian) с установленными Docker и Docker Compose:

```bash
# 1. Клонируем репозиторий
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПО.git format
cd format

# 2. Настраиваем переменные бэкенда (SMTP и почта)
cp backend/.env.example backend/.env
nano backend/.env        # заполните SMTP_HOST/PORT/USER/PASSWORD и RECIPIENT_EMAIL

# 3. Указываем публичный домен (вшивается в сайт при сборке)
export PUBLIC_URL=https://format-irk.ru

# 4a. Полный вариант (с базой данных)
docker compose up -d --build

# ...ИЛИ...

# 4b. Лёгкий вариант без MongoDB (для сервера с 512 МБ ОЗУ)
docker compose -f docker-compose.no-db.yml up -d --build
```

Обновление сайта после изменений в репозитории:

```bash
cd format
git pull
PUBLIC_URL=https://format-irk.ru docker compose up -d --build   # или -f docker-compose.no-db.yml
```

---

## 3c. Сколько нужно ОЗУ и как уложиться в 512 МБ

| Сервис | RAM |
|---|---|
| nginx (frontend) | ~15–25 МБ |
| backend (FastAPI) | ~120–200 МБ |
| MongoDB | ~256 МБ (ограничен в конфиге) |

**Рекомендуется 1–2 ГБ.** Чтобы работать на **512 МБ**:

1. **Используйте лёгкий вариант без базы** — `docker-compose.no-db.yml` (заявки только на e-mail).
2. **Сборка фронтенда прожорлива** (`yarn build` может съесть >1 ГБ). Варианты:
   - собрать образ на более мощной машине / в CI и запушить в реестр, либо
   - добавить swap на сервере (см. ниже).
3. Если используете полный вариант — кэш MongoDB уже ограничен до 256 МБ
   (`--wiredTigerCacheSizeGB 0.25` в `docker-compose.yml`).

**Добавить swap (2 ГБ) — спасает при сборке и пиках нагрузки:**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
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
