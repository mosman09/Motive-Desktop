import type { Config, Context } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are a helpful assistant for MDWebStudio (Motive Web Development), a creative web development and design agency.

You help visitors learn about the company's services and answer their questions warmly and professionally.

Key information about MDWebStudio:
- Services: Branding, Web Development, Desktop Applications, DevOps Automation, AWS Web Services, Database Management, AI Integration, Markdown Documentation, Mobile Apps, API Integration, Chatbot Integration
- Pricing: Starter plan at £399/month (1 design/day), Complete plan at £649/month (2 designs/day)
- Both plans include 24/7 availability and free setup
- The agency uses AI to deliver personalised, high-quality design and development solutions
- Contact: 415-201-6370 | hello@motivedesign.com | 623 Harrison St., 2nd Floor, San Francisco, CA 94107
- Free sample design available for new clients

Keep responses concise, friendly, and focused on helping the visitor. If asked something outside your knowledge, invite them to contact the team directly.`

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let messages: Array<{ role: 'user' | 'assistant'; content: string }>

  try {
    const body = await req.json()
    messages = body.messages

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages format' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return Response.json({ message: text })
  } catch (err) {
    console.error('AI Gateway error:', err)
    return Response.json({ error: 'Failed to get response from AI' }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/chat',
  method: 'POST',
}
