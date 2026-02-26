import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  // Получаем профиль текущего пользователя
  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError || !currentProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Определяем, кого ищем (противоположный пол)
  const lookingFor = currentProfile.gender === 'male' ? 'female' : 'male'

  // Рассчитываем границы дат рождения на основе возраста
  const now = new Date()
  const maxBirthDate = new Date(now.getFullYear() - currentProfile.looking_for_age_min, now.getMonth(), now.getDate()).toISOString().split('T')[0]
  const minBirthDate = new Date(now.getFullYear() - currentProfile.looking_for_age_max, now.getMonth(), now.getDate()).toISOString().split('T')[0]

  // Ищем подходящего пользователя
  const { data: partnerProfile, error: findError } = await supabase
    .from('profiles')
    .select(`
      user_id,
      users!inner(status)
    `)
    .eq('gender', lookingFor)
    .gte('birth_date', minBirthDate)
    .lte('birth_date', maxBirthDate)
    .eq('users.status', 'online')
    .neq('user_id', userId)
    .maybeSingle()

  if (findError || !partnerProfile) {
    return NextResponse.json({ error: 'No partner found' }, { status: 404 })
  }

  return NextResponse.json({ partnerId: partnerProfile.user_id })
}