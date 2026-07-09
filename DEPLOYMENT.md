# Развёртывание сайта ФОРМАТ на своём сервере

Это статический лендинг с формой заявки. База данных **не используется**.
Проект состоит из двух сервисов, запускаемых одной командой через Docker:

- **backend** — FastAPI (принимает форму заявки, отправляет её на e-mail через SMTP)
- **frontend** — собранный React-сайт, который отдаёт nginx и проксирует `/api` на backend

Заявки уходят на e-mail (если настроен SMTP) и в любом случае пишутся в логи бэкенда.

---

## 1. Требования

На сервере должны быть установлены:

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) (входит в состав современного Docker: `docker compose`)

Ресурсы: сайту достаточно **~512 МБ ОЗУ** в работе. Учтите, что сборка фронтенда
(`yarn build`) прожорлива и может требовать >1 ГБ — при нехватке добавьте swap (см. §5).

---

## 2. Настройка переменных окружения

### backend/.env
Скопируйте пример:

```bash
cp backend/.env.example backend/.env
```

Переменные:
- `RECIPIENT_EMAIL` — куда приходят заявки
- `CORS_ORIGINS` — ваш домен, например `https://format-irk.ru` (или `*`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — данные почты для отправки писем

> Для Яндекс.Почты используйте порт `465` и **пароль приложения**, а не обычный пароль.

### Развёртывание БЕЗ почты (пока нет почтового сервера)

Можно запустить сайт сразу, **не настраивая SMTP** — оставьте поля
`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` **пустыми** (в шаблоне они уже пустые).

В этом режиме:
- форма работает и показывает «Спасибо! Мы свяжемся с вами...»;
- каждая заявка пишется в логи контейнера;
- письма не отправляются, ошибок не возникает.

Посмотреть поступившие заявки:

```bash
docker compose logs -f backend | grep "НОВАЯ ЗАЯВКА"
```

Когда появится ящик — впишите SMTP-данные в `backend/.env` и перезапустите backend:

```bash
docker compose up -d --build backend
```

### Публичный адрес (домен)
`PUBLIC_URL` — адрес, по которому сайт открывается в браузере. Он «вшивается»
в React при сборке и используется для запросов к API.

```bash
export PUBLIC_URL=https://format-irk.ru   # ваш реальный домен
```

Локально для проверки можно оставить `http://localhost`.

---

## 3. Запуск из вашего Git-репозитория

На чистом сервере (Ubuntu/Debian) с Docker и Docker Compose:

```bash
# 1. Клонируем репозиторий
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПО.git format
cd format

# 2. Настраиваем backend (можно оставить SMTP пустым — режим без почты)
cp backend/.env.example backend/.env
nano backend/.env

# 3. Указываем публичный домен
export PUBLIC_URL=https://format-irk.ru

# 4. Запускаем
docker compose up -d --build
```

Сайт будет доступен на **80 порту** (`http://ваш-сервер` или ваш домен).

Полезные команды:

```bash
docker compose logs -f backend     # логи бэкенда (и заявки)
docker compose logs -f frontend    # логи nginx
docker compose down                # остановить
```

Обновление после изменений в репозитории:

```bash
cd format
git pull
PUBLIC_URL=https://format-irk.ru docker compose up -d --build
```

---

## 4. HTTPS (рекомендуется)

Самый простой способ — поставить перед контейнерами обратный прокси с авто-SSL:

**Caddy (авто-Let's Encrypt):** пример `Caddyfile`:

```
format-irk.ru {
    reverse_proxy localhost:80
}
```

После включения HTTPS убедитесь, что `PUBLIC_URL` начинается с `https://`,
и пересоберите frontend.

---

## 5. Экономия памяти при сборке (swap)

Если на сервере мало ОЗУ и `yarn build` падает с «heap out of memory»,
добавьте swap (2 ГБ):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Либо соберите образы на более мощной машине / в CI и запушьте в реестр.

---

## 6. Как заменить контент

Весь контент вынесен в один файл:

```
frontend/src/constants/data.js
```

Там: телефон, цены, услуги, преимущества, этапы, портфолио (фото), отзывы, FAQ.
После изменений пересоберите frontend (`docker compose up -d --build`).

---

## 7. Структура

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
