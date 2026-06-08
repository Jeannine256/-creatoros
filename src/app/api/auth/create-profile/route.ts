import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { full_name } = await req.json()

  const { error } = await serviceClient.from('profiles').upsert({
    id: user.id,
    email: user.email!,
    full_name: full_name || null,
  }, { onConflict: 'id' })

  if (error) return new Response(error.message, { status: 500 })
  return new Response('ok')
}
