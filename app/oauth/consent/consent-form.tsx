'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConsentFormProps {
  authorizationId: string
  authDetails: any
}

export default function ConsentForm({ authorizationId, authDetails }: ConsentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setLoading(true)
    setError(null)

    try {
      // В реальном приложении здесь будет вызов API для подтверждения
      // Пока просто эмулируем успех
      alert('Доступ разрешен (заглушка)')
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    setError(null)
    alert('Доступ запрещен (заглушка)')
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Подтверждение доступа</h1>

        <div className="mb-6 space-y-3">
          <p>
            <strong>Приложение:</strong> {authDetails?.client?.name || 'VK'}
          </p>
          <p>
            <strong>Запрашиваемые права:</strong>{' '}
            {authDetails?.scope || 'доступ к профилю'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Разрешить
          </Button>
          <Button
            onClick={handleDeny}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Отказать
          </Button>
        </div>
      </div>
    </div>
  )
}