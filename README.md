# Сайт компании ФОРМАТ — ремонт квартир под ключ (Иркутск)

Премиальный лендинг с формой заявки.

- **Frontend**: React 19 + CRACO + Tailwind CSS (сборка через `npm`)
- **Backend**: FastAPI + SMTP (отправка заявок на e-mail)
- **База данных не используется.** Заявки уходят на e-mail; если SMTP не
  настроен — заявки просто пишутся в логи (режим без почты).

Проект полностью самостоятельный: без внешних (Emergent) зависимостей,
без MongoDB. Запускается на чистой Ubuntu через Docker Compose.

---

## Быстрый старт через Docker (рекомендуется)

Требуется только [Docker](https://docs.docker.com/engine/install/) и
[Docker Compose](https://docs.docker.com/compose/install/).

```bash
git clone <URL-вашего-репозитория> format
cd format
docker compose up -d --build
```

Готово. Сайт доступен на **http://<ваш-сервер>** (порт 80).
Никаких дополнительных файлов или ручных правок после клонирования не нужно —
проект стартует в режиме без почты (заявки пишутся в логи).

Полезные команды:

```bash
docker compose logs -f backend            # логи бэкенда
docker compose logs -f backend | grep "НОВАЯ ЗАЯВКА"   # посмотреть заявки
docker compose down                       # остановить
docker compose up -d --build              # пересобрать и запустить
```

### Включить отправку на e-mail (SMTP)

Задайте переменные окружения перед запуском — либо экспортом в шелле, либо
создав файл `.env` в корне проекта (Docker Compose подхватит его автоматически):

```env
# .env в корне проекта
RECIPIENT_EMAIL=you@example.com
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=you@yandex.ru
SMTP_PASSWORD=пароль-приложения
```

Затем пересоберите:

```bash
docker compose up -d --build
```

> Для Яндекс.Почты используйте порт `465` и **пароль приложения**.
> Список всех переменных бэкенда — в `backend/.env.example`.

### Свой домен / HTTPS

По умолчанию фронтенд обращается к API по относительному пути `/api`
(nginx проксирует его на бэкенд), поэтому сайт работает на любом домене/IP
без настройки.

Для HTTPS поставьте перед контейнерами обратный прокси с авто-SSL, например Caddy:

```
format-irk.ru {
    reverse_proxy localhost:80
}
```

---

## Локальная разработка (без Docker)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # при желании впишите SMTP (можно оставить пустым)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
npm install
# укажите адрес бэкенда для локального дева:
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
npm start                   # dev-сервер на http://localhost:3000
```

Продакшн-сборка:

```bash
npm run build               # результат в frontend/build/
```

---

## Структура проекта

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt        # fastapi, uvicorn, pydantic, aiosmtplib, python-dotenv
│   ├── .env.example
│   └── server.py               # FastAPI: POST /api/leads (SMTP + логирование)
└── frontend/
    ├── Dockerfile              # multi-stage: npm ci + npm run build -> nginx
    ├── nginx.conf              # раздача SPA + прокси /api -> backend:8001
    ├── package.json
    ├── package-lock.json
    ├── .npmrc                  # legacy-peer-deps=true
    ├── craco.config.js
    └── src/
        └── constants/data.js   # ВЕСЬ контент: телефон, цены, услуги, портфолио, отзывы, FAQ
```

---

## Портфолио: как добавить новый объект с локальными фотографиями

Все фотографии хранятся **локально** в проекте:

```
frontend/public/images/portfolio/
├── object-1/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
├── object-2/
│   └── ...
└── placeholder.svg    # заглушка при отсутствии фото
```

### Шаги

1. Создайте папку `frontend/public/images/portfolio/object-N/`.
2. Скопируйте туда фото и назовите их `1.jpg`, `2.jpg`, `3.jpg` ... (любое количество).
3. Откройте `frontend/src/constants/data.js`, найдите массив `PORTFOLIO_ITEMS`
   и добавьте блок (можно скопировать существующий):
   ```js
   {
     id: 7,
     title: "Название проекта",
     desc: "ЖК / улица — Площадь: 60 м²",
     price: "1 200 000 ₽",            // необязательно
     description: "Описание работ...", // необязательно (\n\n = новый абзац)
     images: [
       "/images/portfolio/object-7/1.jpg",
       "/images/portfolio/object-7/2.jpg"
     ],
     tags: ["Дизайнерский", "Гостиная"]
   }
   ```
4. Пересоберите фронтенд (`docker compose up -d --build`).

Галерея, слайдер (свайп/стрелки/клавиатура), лайтбокс и анимации работают
автоматически. Если файла нет — покажется заглушка (`placeholder.svg`).

### Заменить фото существующего объекта

Просто положите новый файл с тем же именем в нужную папку `object-N`.
Путь в `data.js` менять не нужно.
