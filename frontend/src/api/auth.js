// Base URL for the backend API.
// Set VITE_API_URL in a .env file at the project root, e.g.:
//   VITE_API_URL=https://api.example.com
const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    // Response had no JSON body — that's fine, we just fall through.
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}

// Login only needs email + password.
export function loginUser({ email, password }) {
  return request('/api/auth/login', { email, password })
}

// Register needs username + email + password.
export function registerUser({ username, email, password }) {
  return request('/api/auth/register', { username, email, password })
}
