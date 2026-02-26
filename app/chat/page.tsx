'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { questions } from '@/lib/questions'
import { useState } from 'react'

export default function ChatPlaceholderPage() {
  const searchParams = useSearchParams()
  const partnerId = searchParams.get('partnerId')
  const [currentQuestion, setCurrentQuestion] = useState(0)

  if (!partnerId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Ошибка</h1>
        <p className="mb-4">Не указан собеседник</p>
        <Link href="/find">
          <Button>Вернуться к поиску</Button>
        </Link>
      </div>
    )
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Левая часть – видео (заглушка) */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl mb-4">🎥 Видеочат с собеседником</p>
          <p className="text-sm opacity-70">ID партнёра: {partnerId}</p>
          <p className="text-sm opacity-50 mt-8">Здесь будет VideoMost SDK</p>
        </div>
      </div>

      {/* Правая часть – вопросы */}
      <div className="w-96 bg-white border-l p-6 flex flex-col">
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Вопрос {currentQuestion + 1} из {questions.length}
          </span>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-lg font-medium">{questions[currentQuestion]}</p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleNextQuestion}
            className="w-full"
            disabled={currentQuestion === questions.length - 1}
          >
            {currentQuestion === questions.length - 1 ? 'Завершено' : 'Следующий вопрос'}
          </Button>

          <Link href="/find" className="block">
            <Button variant="outline" className="w-full">
              Завершить и выйти
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}