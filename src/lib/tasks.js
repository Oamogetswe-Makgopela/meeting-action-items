import { supabase, isSupabaseConfigured } from './supabaseClient'

export class SaveError extends Error {}

export async function saveTasks(items, sourceNotes) {
  if (!isSupabaseConfigured) {
    throw new SaveError('Supabase is not configured, so tasks cannot be saved.')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new SaveError('You must be signed in to save tasks.')
  }

  const payload = items.map((item) => ({
    user_id: session.user.id,
    title: item.title,
    description: item.description || null,
    owner: item.owner || null,
    due_date: item.due_date || null,
    status: item.status,
    source_notes: sourceNotes || null,
  }))

  const { data, error } = await supabase.from('tasks').insert(payload).select()

  if (error) {
    throw new SaveError(error.message)
  }

  return data
}
