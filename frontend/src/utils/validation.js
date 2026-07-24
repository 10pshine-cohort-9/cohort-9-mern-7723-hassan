export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Min 6 characters, at least one letter, at least one number,
// and at least one special (non-alphanumeric) character.
export const STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.'
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address.'
  return ''
}

export function validateLoginPassword(password) {
  if (!password) return 'Password is required.'
  return ''
}

export function validateStrongPassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return 'Use letters, numbers, and at least one special character.'
  }
  return ''
}

export function validateUsername(username) {
  if (!username.trim()) return 'Username is required.'
  if (username.trim().length < 3) return 'Username must be at least 3 characters.'
  return ''
}
