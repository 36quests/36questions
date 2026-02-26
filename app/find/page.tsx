'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function FindPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/find')
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Ошибка поиска')
      setLoading(false)
      return
    }

    const { partnerId } = await res.json()
    router.push(`/chat?partnerId=${partnerId}`)
  }

  return (
    <div className="container mx-auto max-w-md p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Поиск собеседника</h1>
      <p className="mb-6">
        Нажмите кнопку, чтобы найти подходящего человека для прохождения 36 вопросов.
      </p>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
      <Button onClick={handleSearch} disabled={loading} className="w-full">
        {loading ? 'Поиск...' : 'Найти пару'}
      </Button>
    </div>
  )
}