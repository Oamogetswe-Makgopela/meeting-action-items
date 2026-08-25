import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthForm() {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setSubmitting(false)
    if (authError) {
      setError(authError.message)
    }
  }

  return (
    <div className="panel auth-form">
      <h2>{mode === 'sign-in' ? 'Sign in' : 'Sign up'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </button>
      </form>
      <button
        type="button"
        className="btn-link"
        onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
      >
        {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
