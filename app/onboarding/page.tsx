'use client'

import { useState, useEffect } from 'react'
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
import { CalendarIcon, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Данные формы
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [gender, setGender] = useState<string>('')
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState('')
  const [lookingForGender, setLookingForGender] = useState<string[]>([])
  const [lookingForAgeMin, setLookingForAgeMin] = useState(18)
  const [lookingForAgeMax, setLookingForAgeMax] = useState(50)

  // Получаем userId из куки через API
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUserId(data.user.id)
    }
    fetchUser()
  }, [router])

  // Обработка выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Допустимы только JPEG, PNG и WEBP изображения')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Размер файла не должен превышать 2MB')
      return
    }

    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
    setError(null)
  }

  // Загрузка аватара в Supabase Storage
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null

    setUploadLoading(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      console.error('Upload error:', err)
      setError('Ошибка при загрузке фото')
      return null
    } finally {
      setUploadLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      if (!gender) throw new Error('Выберите пол')
      if (!birthDate) throw new Error('Укажите дату рождения')
      if (!city.trim()) throw new Error('Укажите город')
      if (lookingForGender.length === 0) throw new Error('Выберите, кого вы ищете')

      const uploadedAvatarUrl = await uploadAvatar(userId)

      // Вместо insert используем upsert с onConflict
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          gender,
          birth_date: birthDate.toISOString().split('T')[0],
          city,
          interests: interests.split(',').map(i => i.trim()).filter(i => i),
          looking_for_gender: lookingForGender,
          looking_for_age_min: lookingForAgeMin,
          looking_for_age_max: lookingForAgeMax,
          avatar_url: uploadedAvatarUrl,
        }, { onConflict: 'user_id' }) // предполагаем уникальное ограничение на user_id
        .select() // возвращаем сохранённую запись (опционально)

      if (upsertError) throw upsertError

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

  if (!userId) return <div className="p-8">Загрузка...</div>

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
        {/* Аватар */}
        <div className="space-y-2">
          <Label>Ваше фото</Label>
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                <Image
                  src={avatarUrl}
                  alt="Предпросмотр"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploadLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG или WEBP, до 2MB
              </p>
            </div>
          </div>
        </div>

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

        <Button
          type="submit"
          disabled={loading || uploadLoading}
          className="w-full"
        >
          {uploadLoading ? 'Загрузка фото...' : loading ? 'Сохранение...' : 'Сохранить и продолжить'}
        </Button>
      </form>
    </div>
  )
}