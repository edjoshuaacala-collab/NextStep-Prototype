# NextStep: AI-Assisted Internship Matching and Linkages Platform (Jose Rizal University)

Prototype with **React + Vite** (frontend), **Laravel 11 + Sanctum** (API), **MySQL**, and **Groq** for the chat assistant
(with a rule-based fallback when no API key is set).

Features: login/registration · student dashboard · internship listings (search, filters, details, demo application) ·
floating AI matching chat (bottom-right on Dashboard and Listings).

```
NextStep-Prototype/
├─ backend/    Laravel API (controllers, models, migrations, seeders, routes)
└─ frontend/   React + Vite app
```

## 1. Prerequisites (Windows)

Install once, then verify in the VS Code terminal (PowerShell):

| Tool | Version | Check |
|---|---|---|
| PHP | 8.2+ (enable `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` in `php.ini`) | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 18+ | `node -v` |
| MySQL | 8+ (XAMPP, Laragon or MySQL Installer) | start the MySQL service |

## 2. Database

Create an empty database (PowerShell, adjust the user if needed):

```powershell
mysql -u root -p -e "CREATE DATABASE nextstep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 3. Backend (Terminal 1)

```powershell
cd NextStep-Prototype\backend
composer install
Copy-Item .env.example .env
php artisan key:generate
# Edit .env: set DB_USERNAME / DB_PASSWORD (and optionally GROQ_API_KEY)
php artisan migrate --seed
php artisan serve
```

API runs at http://127.0.0.1:8000 (health check: http://127.0.0.1:8000/up).

## 4. Frontend (Terminal 2)

```powershell
cd NextStep-Prototype\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 . The Vite dev server proxies `/api` to the Laravel server.

**Demo login:** `alex@jru.edu` / `password123` (or register a new student account).
Registration rules: student number like `2023-00000`, password 8+ characters with letters and numbers.

## 5. AI assistant

* Click the round chat icon (bottom-right) on **Dashboard** or **Internship Listings**.
* The assistant asks about interests, skills, experience and preferred roles, then recommends listings from the database
  with **View details** and **Go to application** buttons.
* **Groq mode:** put `GROQ_API_KEY=...` (free key at https://console.groq.com) in `backend/.env`, then run
  `php artisan config:clear`. The key stays on the server and is never sent to the browser.
* **Fallback mode:** with no key (or if Groq errors/timeouts) a rule-based question flow and keyword matcher
  (`app/Services/Matcher.php`) are used automatically.

## 6. Security notes

Passwords hashed (bcrypt), Sanctum bearer tokens (expire after 7 days), validated input, parameterized queries,
login/register/chat rate limiting, CORS limited to `FRONTEND_URL`. For production, use HTTPS, set `APP_DEBUG=false`,
and consider HttpOnly cookies instead of `localStorage` for tokens.

## 7. Troubleshooting

* `could not find driver` → enable `extension=pdo_mysql` in `php.ini`.
* `Access denied for user` → fix `DB_USERNAME`/`DB_PASSWORD` in `backend/.env`.
* PowerShell blocks scripts → `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
* Reset demo data → `php artisan migrate:fresh --seed`.
* Port busy → `php artisan serve --port=8001` and change the proxy target in `frontend/vite.config.js`.

Demo data is fictional. Applications are demo records only; no emails are sent.
