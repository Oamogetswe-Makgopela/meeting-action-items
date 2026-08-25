import { runExtraction, ExtractionValidationError, ExtractionModelError } from './extraction.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

export default function extractApiPlugin() {
  return {
    name: 'extract-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/extract', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        res.setHeader('Content-Type', 'application/json')

        let body
        try {
          body = await readJsonBody(req)
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad_request', message: 'Invalid JSON body.' }))
          return
        }

        try {
          const action_items = await runExtraction({
            notes: body.notes,
            meetingDate: body.meeting_date,
          })
          res.statusCode = 200
          res.end(JSON.stringify({ action_items }))
        } catch (err) {
          if (err instanceof ExtractionValidationError) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad_request', message: err.message }))
          } else if (err instanceof ExtractionModelError) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: 'schema_validation_error', message: err.message }))
          } else {
            res.statusCode = 502
            res.end(
              JSON.stringify({
                error: 'model_error',
                message: 'Extraction failed. Check that the AI provider is configured correctly.',
              }),
            )
          }
        }
      })
    },
  }
}
