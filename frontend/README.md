# frontend

Login + Register pages built with Vite, React, and Tailwind CSS.

## Features

- Register: username, email, password
- Login: email, password only
- Password: minimum 6 characters, must include letters, numbers, and one special character
- Show/hide password toggle on both forms
- Calls a backend API on submit (login and register)
- Fully responsive, fixed app-wide background theme in a Microsoft Word–inspired blue palette

## Setup

```bash
npm install
```

Copy the example env file and point it at your backend:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:4000
```

## Run

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## API contract

The app expects two JSON endpoints on your backend:

- `POST {VITE_API_URL}/api/auth/login`
  - body: `{ "email": "...", "password": "..." }`
- `POST {VITE_API_URL}/api/auth/register`
  - body: `{ "username": "...", "email": "...", "password": "..." }`

On a non-2xx response, the app reads `message` or `error` from the JSON body and displays it above the form. Adjust `src/api/auth.js` if your backend's routes or response shape differ.

## Project structure

```
src/
  api/auth.js              API calls (login, register)
  components/
    AuthLayout.jsx          Shared split-panel layout used by both pages
    PasswordInput.jsx       Password field with show/hide toggle
  pages/
    Login.jsx
    Register.jsx
  utils/validation.js       Email + password validation rules
  App.jsx                   Routes
  main.jsx                  Entry point
  index.css                 Tailwind + fixed background theme
```
