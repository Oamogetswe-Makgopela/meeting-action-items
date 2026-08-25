import { supabase, isSupabaseConfigured } from './supabaseClient'

export class TaskError extends Error {
  constructor(message, category) {
    super(message)
    this.category = category
  }
}

export async function saveTasks(items, sourceNotes) {
  if (!isSupabaseConfigured) {
    throw new TaskError('Supabase is not configured, so tasks cannot be saved.', 'not_configured')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new TaskError('You must be signed in to save tasks.', 'auth_error')
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
    throw new TaskError(error.message, 'save_error')
  }

  return data
}

export async function fetchTasks() {
  if (!isSupabaseConfigured) {
    return []
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return []
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new TaskError(error.message, 'fetch_error')
  }

  return data
}

export async function updateTask(id, patch) {
  const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single()

  if (error) {
    throw new TaskError(error.message, 'update_error')
  }

  return data
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    throw new TaskError(error.message, 'delete_error')
  }
}
