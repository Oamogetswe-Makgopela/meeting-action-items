import { describe, expect, it } from 'vitest'
import { runExtraction, ExtractionValidationError, ExtractionModelError, ActionItemsSchema } from './extraction.js'

function fakeClient(parsedOutput) {
  return {
    messages: {
      async parse() {
        return { parsed_output: parsedOutput }
      },
    },
  }
}

describe('runExtraction validation', () => {
  it('rejects empty notes', async () => {
    await expect(runExtraction({ notes: '  ', meetingDate: '2026-08-25' })).rejects.toBeInstanceOf(
      ExtractionValidationError,
    )
  })

  it('rejects a missing meeting date', async () => {
    await expect(runExtraction({ notes: 'Sarah will do X.', meetingDate: '' })).rejects.toBeInstanceOf(
      ExtractionValidationError,
    )
  })

  it('rejects a malformed meeting date', async () => {
    await expect(
      runExtraction({ notes: 'Sarah will do X.', meetingDate: '08/25/2026' }),
    ).rejects.toBeInstanceOf(ExtractionValidationError)
  })
})

describe('runExtraction with a fake model client', () => {
  it('returns action_items when the model produces valid structured output', async () => {
    const items = await runExtraction(
      { notes: 'Sarah will send the proposal to John by Friday.', meetingDate: '2026-08-25' },
      {
        client: fakeClient({
          action_items: [
            {
              title: 'Send revised pricing proposal to Acme',
              description: 'Update the proposal with the pricing discussed in the meeting.',
              owner: 'Sarah',
              due_date: '2026-09-01',
              status: 'todo',
            },
          ],
        }),
      },
    )
    expect(items).toHaveLength(1)
    expect(items[0].owner).toBe('Sarah')
    expect(items[0].due_date).toBe('2026-09-01')
  })

  it('allows empty owner and due_date rather than requiring guesses', async () => {
    const items = await runExtraction(
      { notes: 'Priya will update the onboarding document.', meetingDate: '2026-08-25' },
      {
        client: fakeClient({
          action_items: [
            {
              title: 'Update onboarding document',
              description: 'Priya will update the onboarding document.',
              owner: 'Priya',
              due_date: '',
              status: 'todo',
            },
          ],
        }),
      },
    )
    expect(items[0].due_date).toBe('')
  })

  it('throws ExtractionModelError when the model returns no parsed output', async () => {
    await expect(
      runExtraction(
        { notes: 'Sarah will send the proposal.', meetingDate: '2026-08-25' },
        { client: fakeClient(null) },
      ),
    ).rejects.toBeInstanceOf(ExtractionModelError)
  })
})

describe('ActionItemsSchema', () => {
  it('rejects a non-ISO due_date', () => {
    const result = ActionItemsSchema.safeParse({
      action_items: [
        { title: 'Task', description: '', owner: '', due_date: 'next Friday', status: 'todo' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts a well-formed action item', () => {
    const result = ActionItemsSchema.safeParse({
      action_items: [
        { title: 'Task', description: 'desc', owner: 'Sarah', due_date: '2026-09-01', status: 'todo' },
      ],
    })
    expect(result.success).toBe(true)
  })
})
