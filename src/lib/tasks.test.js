import { describe, expect, it } from 'vitest'
import { saveTasks, SaveError } from './tasks'

describe('saveTasks', () => {
  it('throws a clear SaveError when Supabase is not configured', async () => {
    await expect(saveTasks([{ title: 'Task', status: 'todo' }], 'notes')).rejects.toThrow(SaveError)
    await expect(saveTasks([{ title: 'Task', status: 'todo' }], 'notes')).rejects.toThrow(
      /not configured/,
    )
  })
})
