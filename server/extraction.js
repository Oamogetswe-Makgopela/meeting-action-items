import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

export class ExtractionValidationError extends Error {}
export class ExtractionModelError extends Error {}

const ActionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  owner: z.string(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be an ISO date (YYYY-MM-DD) or empty')
    .or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'done']),
})

export const ActionItemsSchema = z.object({
  action_items: z.array(ActionItemSchema),
})

export function buildSystemPrompt(meetingDate) {
  return `You extract action items from raw meeting notes.

The meeting took place on ${meetingDate}. Use this date as the anchor for
resolving any relative dates mentioned in the notes (e.g. "next Friday",
"in two weeks", "tomorrow") into absolute dates in YYYY-MM-DD format.

Rules:
- Only extract explicit or strongly implied action items.
- Extract the owner only when a person is actually mentioned as responsible. Never invent an owner. If none is identifiable, use an empty string.
- Extract a due date only when it is explicitly stated or can be unambiguously resolved to a specific calendar date using the meeting date above. Never guess a due date. If the notes only say something vague like "next week" with no specific day, leave due_date empty rather than guessing a date.
- Preserve enough context in the description field to make the task understandable on its own, without re-reading the notes.
- Set status to "todo" for every newly extracted item.
- Return every action item you find, even if some fields are empty.`
}

export async function runExtraction({ notes, meetingDate }, { client } = {}) {
  if (!notes || !notes.trim()) {
    throw new ExtractionValidationError('Meeting notes are required.')
  }
  if (!meetingDate || !/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) {
    throw new ExtractionValidationError('A valid meeting date (YYYY-MM-DD) is required.')
  }

  const anthropic = client ?? new Anthropic()

  const response = await anthropic.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 4096,
    system: buildSystemPrompt(meetingDate),
    messages: [{ role: 'user', content: notes }],
    output_config: { format: zodOutputFormat(ActionItemsSchema) },
  })

  if (!response.parsed_output) {
    throw new ExtractionModelError('The model did not return valid structured output.')
  }

  return response.parsed_output.action_items
}
