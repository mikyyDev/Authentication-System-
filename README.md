# Authentication System

FastAPI + SQLite backend with a Vite frontend for registration, login, profile lookup, and account deletion.

## Features

- User registration with hashed passwords
- JWT login
- Protected `/me` profile endpoint
- Account deletion
- Refresh tokens
- Rate limiting on sensitive endpoints
- Request logging
- SQLite database
- CORS enabled for frontend/mobile clients
- Health check endpoint

## Tech Stack

- FastAPI
- SQLite
- SQLAlchemy
- JWT via `python-jose`
- Password hashing via `passlib[bcrypt]`
- React + Vite

## Project Structure

- `backend/` - FastAPI app, models, schemas, and auth helpers
- `frontend/` - Vite app for the user interface

## Setup

### Backend

1. Create and activate a virtual environment.
2. Install dependencies from `backend/requirements.txt`.
3. Set environment variables.
4. Run the API with Uvicorn.

Example:

```bash
cd "C:\Users\micha\Desktop\New folder\Fluentian\Authentication system"
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

1. Install dependencies from `frontend/package.json`.
2. Set `VITE_API_URL` to your backend URL if you are not using the local default.
3. Run the app with Vite.

Example:

```bash
cd "C:\Users\micha\Desktop\New folder\Fluentian\Authentication system\frontend"
npm install
npm run dev
```

## Environment Variables

- `SECRET_KEY` - JWT signing secret
- `ALGORITHM` - JWT algorithm, default `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` - token lifetime, default `30`
- `REFRESH_TOKEN_EXPIRE_DAYS` - refresh token lifetime, default `7`
- `CORS_ORIGINS` - comma-separated list of allowed origins, default `*`
- `LOGIN_RATE_LIMIT` - login attempts per window, default `5`
- `LOGIN_RATE_LIMIT_WINDOW_SECONDS` - login rate limit window, default `60`
- `SEND_CODE_RATE_LIMIT` - OTP requests per window, default `3`
- `SEND_CODE_RATE_LIMIT_WINDOW_SECONDS` - OTP rate limit window, default `300`

Example `.env`:

```env
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend environment example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## API Endpoints

`GET /health`

Response:

```json
{ "message": "ok" }
```

### Register

`POST /register`

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "strongpassword123"
}
```

Response:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Login

`POST /login`

Request (`application/x-www-form-urlencoded`):

`username=john@example.com&password=strongpassword123`

Response:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "refresh_token": "refresh-token-here"
}
```

### Refresh Token

`POST /refresh`

Request:

```json
{ "refresh_token": "refresh-token-here" }
```

Response:

```json
{
  "access_token": "new-access-token-here",
  "token_type": "bearer",
  "refresh_token": "new-refresh-token-here"
}
```

### Current User

`GET /me`

Headers:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Delete Account

`DELETE /delete-account`

Headers:

```http
Authorization: Bearer <token>
```

Response:

```json
{ "message": "Account deleted successfully" }
```

## Error Handling

- `400` invalid credentials, duplicate email, invalid verification code
- `401` invalid or missing token
- `404` user not found

## Notes

- Passwords are never stored in plain text.
- For local development, keep the backend running on `http://127.0.0.1:8000` and the frontend on `http://127.0.0.1:5173`.
