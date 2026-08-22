import {
  validateEmail,
  validateLoginPassword,
  validateStrongPassword,
  validateUsername,
} from './validation'

describe('validateEmail', () => {
  test('returns error when email is empty', () => {
    expect(validateEmail('')).toBe('Email is required.')
  })

  test('returns error for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(
      'Enter a valid email address.'
    )
  })

  test('returns empty string for valid email', () => {
    expect(validateEmail('test@example.com')).toBe('')
  })

  test('accepts email with surrounding spaces', () => {
    expect(validateEmail('  test@example.com  ')).toBe('')
  })
})

describe('validateLoginPassword', () => {
  test('returns error when password is empty', () => {
    expect(validateLoginPassword('')).toBe('Password is required.')
  })

  test('returns empty string when password is provided', () => {
    expect(validateLoginPassword('password123')).toBe('')
  })
})

describe('validateStrongPassword', () => {
  test('returns error when password is empty', () => {
    expect(validateStrongPassword('')).toBe('Password is required.')
  })

  test('returns error when password is shorter than 6 characters', () => {
    expect(validateStrongPassword('Ab1!')).toBe(
      'Password must be at least 6 characters.'
    )
  })

  test('returns error when password has no letter', () => {
    expect(validateStrongPassword('12345!')).toBe(
      'Use letters, numbers, and at least one special character.'
    )
  })

  test('returns error when password has no number', () => {
    expect(validateStrongPassword('abcdef!')).toBe(
      'Use letters, numbers, and at least one special character.'
    )
  })

  test('returns error when password has no special character', () => {
    expect(validateStrongPassword('abc123')).toBe(
      'Use letters, numbers, and at least one special character.'
    )
  })

  test('returns empty string for a strong password', () => {
    expect(validateStrongPassword('Abc123!')).toBe('')
  })
})

describe('validateUsername', () => {
  test('returns error when username is empty', () => {
    expect(validateUsername('')).toBe('Username is required.')
  })

  test('returns error when username is shorter than 3 characters', () => {
    expect(validateUsername('ab')).toBe(
      'Username must be at least 3 characters.'
    )
  })

  test('returns empty string for valid username', () => {
    expect(validateUsername('Ahmed')).toBe('')
  })

  test('accepts username with surrounding spaces', () => {
    expect(validateUsername('  Ahmed  ')).toBe('')
  })
})