import { describe, expect, it } from 'vitest'
import { saveTasks, fetchTasks, TaskError } from './tasks'

describe('saveTasks', () => {
  it('throws a clear TaskError when Supabase is not configured', async () => {
    await expect(saveTasks([{ title: 'Task', status: 'todo' }], 'notes')).rejects.toThrow(TaskError)
    await expect(saveTasks([{ title: 'Task', status: 'todo' }], 'notes')).rejects.toThrow(
      /not configured/,
    )
  })
})

describe('fetchTasks', () => {
  it('returns an empty list when Supabase is not configured, rather than throwing', async () => {
    await expect(fetchTasks()).resolves.toEqual([])
  })
})
