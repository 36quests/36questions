import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  console.log('=== CALLBACK STARTED ===')
  console.log('Request URL:', request.url)

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') || '/'
  const device_id = searchParams.get('device_id')
  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('vk_code_verifier')?.value

  console.log('code present:', !!code)
  console.log('codeVerifier present:', !!codeVerifier)
  console.log('device_id:', device_id)
  console.log('state:', state)

  if (!code || !codeVerifier) {
    console.error('Missing code or verifier')
    return NextResponse.redirect(
      new URL('/login?error=missing_params', process.env.NEXT_PUBLIC_APP_URL)
    )
  }

  try {
    // 1. Обмен кода на токены
    const bodyParams = new URLSearchParams({
      client_id: process.env.VK_CLIENT_ID!,
      client_secret: process.env.VK_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/vk/callback`,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
    })
    if (device_id) {
      bodyParams.append('device_id', device_id)
    }

    console.log('Exchanging code for tokens via /auth...')
    const tokenResponse = await fetch('https://id.vk.ru/oauth2/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
    })

    const contentType = tokenResponse.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await tokenResponse.text()
      console.error('VK returned non-JSON. Status:', tokenResponse.status)
      console.error('Response text:', text.substring(0, 500))
      throw new Error('Invalid response from VK token endpoint')
    }

    const tokens = await tokenResponse.json()
    console.log('Token response status:', tokenResponse.status)
    console.log('Token response body:', JSON.stringify(tokens, null, 2))

    if (!tokens.id_token) {
      console.error('No id_token in response')
      throw new Error('Missing id_token')
    }

    // 2. Получение данных пользователя
    const userResponse = await fetch('https://id.vk.ru/oauth2/user_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.VK_CLIENT_ID!,
        access_token: tokens.access_token,
      }),
    })

    const userData = await userResponse.json()
    console.log('User info response status:', userResponse.status)
    console.log('User info response body:', JSON.stringify(userData, null, 2))

    const vkUser = userData.user || userData
    if (!vkUser || !vkUser.user_id) {
      console.error('No user data or user_id missing')
      throw new Error('Failed to get user data')
    }

    // 3. Инициализация Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // 4. Поиск или создание пользователя
    console.log('Looking up user in DB with vk_id:', vkUser.user_id)
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('vk_id', vkUser.user_id)
      .maybeSingle()

    if (selectError) {
      console.error('Error selecting user:', selectError)
      throw selectError
    }

    let userId
    if (!existingUser) {
      console.log('User not found, creating new user...')
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          vk_id: vkUser.user_id,
          email: vkUser.email || null,
          first_name: vkUser.first_name || '',
          last_name: vkUser.last_name || '',
          avatar: vkUser.avatar || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting user:', insertError)
        throw insertError
      }
      userId = newUser.id
      console.log('New user created with id:', userId)
    } else {
      userId = existingUser.id
      console.log('Existing user found with id:', userId)
    }

    // 5. Установка статуса онлайн
    const { error: statusError } = await supabase
      .from('users')
      .update({ status: 'online' })
      .eq('id', userId)

    if (statusError) {
      console.error('Error updating status:', statusError)
    } else {
      console.log('User status set to online')
    }

    // 6. Проверка наличия профиля (анкеты)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    const redirectPath = profile ? state : '/onboarding'
    const redirectUrl = new URL(redirectPath, process.env.NEXT_PUBLIC_APP_URL)
    console.log('Redirecting to:', redirectUrl.toString())

    // 7. Установка куки user_id
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('user_id', userId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      sameSite: 'lax',
      secure: true, // для HTTPS обязательно
    })

    console.log('=== CALLBACK FINISHED SUCCESSFULLY ===')
    return response

  } catch (error) {
    console.error('=== CALLBACK ERROR ===', error)
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}