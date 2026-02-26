import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ConsentForm from './consent-form'

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ authorization_id?: string }>
}) {
  const { authorization_id } = await searchParams

  if (!authorization_id) {
    return <div>Ошибка: отсутствует authorization_id</div>
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/oauth/consent?authorization_id=${authorization_id}`)
  }

  // В реальном приложении здесь будет запрос к Supabase OAuth серверу
  // Но пока заглушка, так как OAuth сервер мы еще не настроили полностью
  const authDetails = {
    client: { name: 'VK' },
    scope: 'доступ к профилю, email'
  }

  return <ConsentForm authorizationId={authorization_id} authDetails={authDetails} />
}