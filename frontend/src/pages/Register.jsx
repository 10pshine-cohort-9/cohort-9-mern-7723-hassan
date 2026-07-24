import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { registerUser } from '../api/auth.js'
import { validateEmail, validateStrongPassword, validateUsername } from '../utils/validation.js'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const next = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validateStrongPassword(form.password),
    }
    setErrors(next)
    return !next.username && !next.email && !next.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')
    try {
      const res= await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setTimeout(() => navigate("/login/"), 1500);
      }
    } catch (err) {
      setServerError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Just a username, email, and password."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-word-500 hover:text-word-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-ink mb-1.5">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
            placeholder="Choose a username"
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-ink placeholder:text-subtle/70 outline-none transition-colors focus:border-word-500 focus:ring-2 focus:ring-word-100 ${
              errors.username ? 'border-red-400' : 'border-line'
            }`}
          />
          {errors.username ? (
            <p id="username-error" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.username}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="you@example.com"
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-ink placeholder:text-subtle/70 outline-none transition-colors focus:border-word-500 focus:ring-2 focus:ring-word-100 ${
              errors.email ? 'border-red-400' : 'border-line'
            }`}
          />
          {errors.email ? (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          hint="At least 6 characters, with letters, numbers, and a special character."
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-word-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-word-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-word-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
