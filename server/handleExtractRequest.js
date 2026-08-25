import { runExtraction, ExtractionValidationError, ExtractionModelError } from './extraction.js'

// Framework-agnostic handler: takes a parsed JSON body, returns { status, body }.
// Shared by the Vite dev middleware and the Vercel serverless function so the
// two entry points can never drift on error-response shape.
export async function handleExtractRequest(body) {
  try {
    const action_items = await runExtraction({
      notes: body?.notes,
      meetingDate: body?.meeting_date,
    })
    return { status: 200, body: { action_items } }
  } catch (err) {
    if (err instanceof ExtractionValidationError) {
      return { status: 400, body: { error: 'bad_request', message: err.message } }
    }
    if (err instanceof ExtractionModelError) {
      return { status: 502, body: { error: 'schema_validation_error', message: err.message } }
    }
    return {
      status: 502,
      body: {
        error: 'model_error',
        message: 'Extraction failed. Check that the AI provider is configured correctly.',
      },
    }
  }
}
