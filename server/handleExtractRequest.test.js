import { describe, expect, it } from 'vitest'
import { handleExtractRequest } from './handleExtractRequest.js'

describe('handleExtractRequest', () => {
  it('returns 400 bad_request for empty notes', async () => {
    const { status, body } = await handleExtractRequest({ notes: '  ', meeting_date: '2026-08-25' })
    expect(status).toBe(400)
    expect(body.error).toBe('bad_request')
  })

  it('returns 400 bad_request for a missing meeting date', async () => {
    const { status, body } = await handleExtractRequest({ notes: 'Sarah will do X.' })
    expect(status).toBe(400)
    expect(body.error).toBe('bad_request')
  })

  it('returns 502 model_error when no model client/credentials are available', async () => {
    const { status, body } = await handleExtractRequest({
      notes: 'Sarah will do X.',
      meeting_date: '2026-08-25',
    })
    expect(status).toBe(502)
    expect(body.error).toBe('model_error')
  })

  it('handles a missing body without throwing', async () => {
    const { status, body } = await handleExtractRequest(undefined)
    expect(status).toBe(400)
    expect(body.error).toBe('bad_request')
  })
})
