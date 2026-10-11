import { convertToModelMessages, streamText, type UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-5.5',
    system:
      'You are Koryx AI, a helpful assistant for a premium web development studio. Be concise, clear, professional, and helpful.',
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
