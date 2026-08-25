import { handleExtractRequest } from './handleExtractRequest.js'

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

        const { status, body: responseBody } = await handleExtractRequest(body)
        res.statusCode = status
        res.end(JSON.stringify(responseBody))
      })
    },
  }
}
