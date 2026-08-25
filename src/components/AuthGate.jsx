import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { useSession } from '../hooks/useSession'
import AuthForm from './AuthForm'

export default function AuthGate({ children }) {
  const { session, loading } = useSession()

  if (!isSupabaseConfigured) {
    return (
      <div className="panel">
        <p>
          Supabase is not configured. Copy <code>.env.example</code> to{' '}
          <code>.env</code> and fill in your project credentials to enable
          sign-in.
        </p>
      </div>
    )
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!session) {
    return <AuthForm />
  }

  return (
    <>
      <div className="session-bar">
        <span>{session.user.email}</span>
        <button type="button" className="btn" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
      {children}
    </>
  )
}
