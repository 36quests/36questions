'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/utils/supabase/client'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface OnboardingFormProps {
  userId: string
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Данные формы
  const [gender, setGender] = useState<string>('')
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState('')
  const [lookingForGender, setLookingForGender] = useState<string[]>([])
  const [lookingForAgeMin, setLookingForAgeMin] = useState(18)
  const [lookingForAgeMax, setLookingForAgeMax] = useState(50)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!gender) throw new Error('Выберите пол')
      if (!birthDate) throw new Error('Укажите дату рождения')
      if (!city.trim()) throw new Error('Укажите город')
      if (lookingForGender.length === 0) throw new Error('Выберите, кого вы ищете')

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          gender,
          birth_date: birthDate.toISOString().split('T')[0],
          city,
          interests: interests.split(',').map(i => i.trim()).filter(i => i),
          looking_for_gender: lookingForGender,
          looking_for_age_min: lookingForAgeMin,
          looking_for_age_max: lookingForAgeMax,
        })

      if (insertError) throw insertError

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLookingFor = (value: string) => {
    setLookingForGender(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    )
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-6">Заполните анкету</h1>
      <p className="text-gray-600 mb-8">
        Это поможет нам подобрать подходящего собеседника
      </p>

      {error && (
        <div className="mb-6 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Пол */}
        <div className="space-y-2">
          <Label>Ваш пол</Label>
          <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Мужской</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Женский</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Другой</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Дата рождения */}
        <div className="space-y-2">
          <Label>Дата рождения</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !birthDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, 'PPP', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                initialFocus
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear() - 16}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Город */}
        <div className="space-y-2">
          <Label htmlFor="city">Город</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Например, Москва"
            required
          />
        </div>

        {/* Интересы */}
        <div className="space-y-2">
          <Label htmlFor="interests">Интересы (через запятую)</Label>
          <Input
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="путешествия, психология, йога"
          />
          <p className="text-sm text-gray-500">Укажите несколько через запятую</p>
        </div>

        {/* Кого ищет */}
        <div className="space-y-3">
          <Label>Кого вы ищете?</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="looking_male"
                checked={lookingForGender.includes('male')}
                onCheckedChange={() => toggleLookingFor('male')}
              />
              <Label htmlFor="looking_male">Мужчин</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="looking_female"
                checked={lookingForGender.includes('female')}
                onCheckedChange={() => toggleLookingFor('female')}
              />
              <Label htmlFor="looking_female">Женщин</Label>
            </div>
          </div>
        </div>

        {/* Возрастные предпочтения */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age_min">Возраст от</Label>
            <Input
              id="age_min"
              type="number"
              min={16}
              max={100}
              value={lookingForAgeMin}
              onChange={(e) => setLookingForAgeMin(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age_max">Возраст до</Label>
            <Input
              id="age_max"
              type="number"
              min={16}
              max={100}
              value={lookingForAgeMax}
              onChange={(e) => setLookingForAgeMax(Number(e.target.value))}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить и продолжить'}
        </Button>
      </form>
    </div>
  )
}