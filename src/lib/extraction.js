export class ExtractionError extends Error {
  constructor(message, category) {
    super(message)
    this.category = category
  }
}

export async function extractActionItems({ notes, meetingDate }) {
  let response
  try {
    response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, meeting_date: meetingDate }),
    })
  } catch {
    throw new ExtractionError('Could not reach the extraction service.', 'network_error')
  }

  let body
  try {
    body = await response.json()
  } catch {
    throw new ExtractionError('The extraction service returned an invalid response.', 'schema_validation_error')
  }

  if (!response.ok) {
    throw new ExtractionError(body.message || 'Extraction failed.', body.error || 'model_error')
  }

  return body.action_items
}
