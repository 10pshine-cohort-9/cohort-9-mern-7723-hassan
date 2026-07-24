import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { loginUser } from '../api/auth.js'
import axios from 'axios'
import { validateEmail, validateLoginPassword } from '../utils/validation.js'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      email: validateEmail(form.email),
      password: validateLoginPassword(form.password),
    }
    setErrors(next)
    return !next.email && !next.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.token);
        setTimeout(() => navigate("/dashboard/"), 1500);
      }
    } catch (err) {setServerError(err.response?.data?.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Enter your email and password to continue."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-word-500 hover:text-word-600">
            Create an account
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
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-ink placeholder:text-subtle/70 outline-none transition-colors focus:border-word-500 focus:ring-2 focus:ring-word-100 ${errors.email ? 'border-red-400' : 'border-line'
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
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm font-medium text-word-500 hover:text-word-600">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-word-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-word-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-word-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
