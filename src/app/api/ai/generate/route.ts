import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const PROMPTS: Record<string, (deal: any) => string> = {
  outreach: (d) => `You are a professional talent manager writing a cold outreach email for a content creator.

Deal context:
- Sponsor/brand: ${(d.sponsors as any)?.name ?? d.title}
- Platform: ${d.platform ?? 'YouTube/Instagram'}
- Content type: ${d.content_type ?? 'sponsored integration'}
- Proposed value: ${d.value ? `CHF ${d.value}` : 'to be negotiated'}

Write a concise, professional cold outreach email (150-200 words) from the creator to the brand's marketing team. The email should:
1. Open with a personalized observation about the brand
2. Briefly establish the creator's audience and relevance
3. Propose a specific collaboration
4. Include a clear call to action
5. Sound human, not templated

Output only the email text.`,

  followup: (d) => `Write a brief, friendly follow-up email (under 100 words) for a sponsorship deal that hasn't received a reply after 5 business days.

Original deal: ${d.title}
Brand: ${(d.sponsors as any)?.name ?? 'the brand'}

Keep it light, not pushy. Add a small hook (new content angle or recent channel milestone).`,

  report: (d) => `Create a professional post-campaign performance report template for a sponsorship deal.

Deal: ${d.title}
Brand: ${(d.sponsors as any)?.name ?? 'Brand'}
Platform: ${d.platform ?? 'YouTube'}
Deal value: ${d.value ? `CHF ${d.value}` : 'undisclosed'}
Content type: ${d.content_type ?? 'integration'}

Generate a report structure with placeholder sections for: campaign overview, performance metrics (views, clicks, conversions), audience insights, key takeaways, and next steps. Format professionally with headers.`,

  brief_summary: (d) => `Extract and summarize the key requirements from this sponsor brief. Format as a bullet-point checklist the creator needs to complete.

Brief text:
${d.brief_text ?? 'No brief provided. Generate a generic example checklist for a YouTube sponsorship.'}

Output:
- Key deliverables (what content must be made)
- Mandatory talking points
- Restrictions or prohibitions
- Deadlines
- Approval process requirements`,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  if (!anthropic) return new Response('AI features require an Anthropic API key. Add ANTHROPIC_API_KEY to your environment.', { status: 503 })

  const { mode, deal } = await req.json()
  const prompt = PROMPTS[mode]?.(deal)
  if (!prompt) return new Response('Invalid mode', { status: 400 })

  const stream = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
