import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Функция для генерации code_verifier (случайная строка, соответствующая требованиям VK)
function generateCodeVerifier() {
  // Генерируем 32 байта случайных данных и кодируем в base64url (без padding)
  return crypto.randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Функция для создания code_challenge методом S256
async function generateCodeChallenge(verifier: string) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  // Кодируем хеш в base64url (без padding)
  return hash.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirect = searchParams.get('redirect') || '/'

  // Генерируем правильные PKCE параметры
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const vkAuthUrl = new URL('https://id.vk.ru/authorize')
  vkAuthUrl.searchParams.set('client_id', process.env.VK_CLIENT_ID!)
  vkAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/vk/callback`)
  vkAuthUrl.searchParams.set('response_type', 'code')
  vkAuthUrl.searchParams.set('scope', 'openid email vkid.personal_info') // добавил vkid.personal_info
  vkAuthUrl.searchParams.set('code_challenge', codeChallenge)
  vkAuthUrl.searchParams.set('code_challenge_method', 'S256')
  vkAuthUrl.searchParams.set('state', redirect)

  const response = NextResponse.redirect(vkAuthUrl.toString())

  // Сохраняем code_verifier в куки
  response.cookies.set('vk_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 минут
    sameSite: 'lax',
    secure: true,
  })

  console.log('Generated PKCE: challenge_method=S256, verifier length:', codeVerifier.length)
  return response
}