import { handleExtractRequest } from '../server/handleExtractRequest.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { status, body } = await handleExtractRequest(req.body)
  res.status(status).json(body)
}
