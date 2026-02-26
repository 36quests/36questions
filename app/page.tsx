'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1E3A5F] font-sans">
      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-[#F5F0E8]/80 backdrop-blur-sm border-b border-[#1E3A5F]/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-serif text-2xl font-bold text-[#1E3A5F]">36 вопросов</div>
          
          {/* Десктопное меню */}
          <nav className="hidden md:flex gap-6 items-center">
            <button onClick={() => scrollToSection('about')} className="hover:underline">О нас</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:underline">Как это работает</button>
            <button onClick={() => scrollToSection('faq')} className="hover:underline">FAQ</button>
            <Link href="/api/auth/vk">
              <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl">
                Войти через VK
              </Button>
            </Link>
          </nav>

          {/* Мобильное меню (бургер) */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Мобильное выпадающее меню */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#F5F0E8] border-t border-[#1E3A5F]/10 py-4 px-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection('about')} className="text-left py-2">О нас</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2">Как это работает</button>
            <button onClick={() => scrollToSection('faq')} className="text-left py-2">FAQ</button>
            <Link href="/api/auth/vk" className="w-full">
              <Button className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl">
                Войти через VK
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Герой (первый экран) */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Влюбиться за один вечер?<br />
              <span className="text-[#1E3A5F]">Возможно. Узнать человека по-настоящему — О, да!</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0">
              36 вопросов, которые заменяют месяцы переписки и неловких свиданий. Видеочат с незнакомцем, где диалог уже построен за вас.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/api/auth/vk">
                <Button size="lg" className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white text-lg px-8 py-6 rounded-xl">
                  Начать знакомство
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-4 opacity-70">Бесплатно. 45 минут. Без регистрации (только VK ID).</p>
          </div>
          <div className="flex-1 relative w-full max-w-md mx-auto md:max-w-none">
            {isMobile ? (
              <Image
                src="/images/hero-mobile.jpg"
                alt="Видеочат"
                width={400}
                height={400}
                className="rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
            ) : (
              <Image
                src="/images/hero-desktop.jpg"
                alt="Видеочат"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl w-full h-auto"
                priority
              />
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-[#1E3A5F]/50" />
        </div>
      </section>

      {/* Проблема и решение */}
      <section id="about" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 shadow-xl border-0 bg-white">
              <h2 className="font-serif text-3xl mb-4 text-[#1E3A5F]">Как было раньше</h2>
              <p className="text-lg leading-relaxed">
                Знакомства в интернете — это игра в угадайку. «Привет, как дела?» — «Нормально, а у тебя?» И так по кругу, пока терпение не лопнет. Поверхностные диалоги, пустая трата времени, разочарование.
              </p>
            </Card>
            <Card className="p-8 shadow-xl border-0 bg-white">
              <h2 className="font-serif text-3xl mb-4 text-[#1E3A5F]">Как будет теперь</h2>
              <p className="text-lg leading-relaxed">
                Мы убрали неловкость первого шага. У вас есть 36 вопросов, выстроенных от простых к самым сокровенным. Вы просто отвечаете честно — близость рождается сама.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Всё просто. Три шага к настоящему диалогу.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border-0 bg-white shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1E3A5F] text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Вход через VK ID</h3>
              <p className="opacity-70">Никаких длинных регистраций. Входите через VK — и вы уже в системе.</p>
            </Card>
            <Card className="p-6 text-center border-0 bg-white shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1E3A5F] text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Короткая анкета</h3>
              <p className="opacity-70">Укажите пол, возраст, фото — чтобы мы нашли подходящего собеседника.</p>
            </Card>
            <Card className="p-6 text-center border-0 bg-white shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center">
                <span className="text-[#1E3A5F] text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">36 вопросов в видеочате</h3>
              <p className="opacity-70">Вы по очереди отвечаете, диалог идёт сам. Никакой неловкости.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Научная основа */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Не магия. Наука.</h2>
          <p className="text-lg leading-relaxed">
            В 1997 году психолог Артур Арон провёл эксперимент: он доказал, что 36 специально составленных вопросов могут создать близость между абсолютно незнакомыми людьми. Спустя годы этот метод стал легендой. Мы просто перенесли его в онлайн-формат.
          </p>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Почему это 100% работает лучше обычных знакомств?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-0 bg-white shadow-lg">
              <MessageCircle className="w-10 h-10 text-[#1E3A5F] mb-4" />
              <h3 className="font-semibold mb-2">Структура вместо неловкости</h3>
              <p className="text-sm opacity-70">Диалог уже построен за вас. Вам не придётся даже задумываться, о чём говорить.</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <Heart className="w-10 h-10 text-[#1E3A5F] mb-4" />
              <h3 className="font-semibold mb-2">Глубина без усилий</h3>
              <p className="text-sm opacity-70">Вы узнаёте человека так, как не узнали бы за 10 свиданий. И даже так как его не знают близкие люди!</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <Shield className="w-10 h-10 text-[#1E3A5F] mb-4" />
              <h3 className="font-semibold mb-2">Безопасность и уважение</h3>
              <p className="text-sm opacity-70">Только мужчины и женщины, ищущие серьёзных отношений. Никакого флирта.</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <Sparkles className="w-10 h-10 text-[#1E3A5F] mb-4" />
              <h3 className="font-semibold mb-2">Для тех, кто устал от «свайпов»</h3>
              <p className="text-sm opacity-70">Если надоело листать анкеты — этот сервис для вас.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Отзывы (заглушка) */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Первые отзывы</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Я думал, что это очередной бред, но после 20 вопросов понял, что рассказываю то, о чём даже друзьям не говорил. Мы продолжили общаться после чата.»</p>
              <p className="font-semibold">— Александр, 34 года</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Наконец-то сервис, где не нужно придумывать, как начать разговор. Просто отвечаешь на вопросы и слушаешь. Никакой неловкости.»</p>
              <p className="font-semibold">— Екатерина, 29 лет</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Мы с будущим мужем познакомились именно так. Через месяц после чата он сделал мнепредложение.»</p>
              <p className="font-semibold">— Анна, 31 год</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Это увлекает. По-настоящему... Ты буквально хочешь узнавать человека больше и глубже с каждым вопросом, а он хочет узнавать тебя. После сеанса мы встретились и всё завертелось»</p>
              <p className="font-semibold">— Евгений, 40 лет</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Ааа, Это безумие! Как, чёрт возьми вы это сделали? »</p>
              <p className="font-semibold">— Люба, 30 лет</p>
            </Card>
            <Card className="p-6 border-0 bg-white shadow-lg">
              <p className="italic mb-4">«Теперь мы просыпаемся вместе каждое утро, что бы жить эту жизнь рядом. Волшебство, какое-то»</p>
              <p className="font-semibold">— Кирилл и Мария</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Часто задаваемые вопросы</h2>
          <div className="space-y-4">
            <Card className="p-4 border-0 bg-white shadow">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-semibold">
                  Это дейтинг-приложение?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 opacity-70">Скорее, это пространство для глубоких знакомств. Мы не про «свайпы», а про настоящий диалог.</p>
              </details>
            </Card>
            <Card className="p-4 border-0 bg-white shadow">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-semibold">
                  Мне обязательно включать видео?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 opacity-70">Да, видеочат — ключевая часть опыта. Но на первых 12 вопросах можно оставить только голос, чтобы привыкнуть.</p>
              </details>
            </Card>
            <Card className="p-4 border-0 bg-white shadow">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-semibold">
                  Сколько времени это занимает?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 opacity-70">Около 45–60 минут. Но если захотите продолжить общение, никто вас не остановит.</p>
              </details>
            </Card>
            <Card className="p-4 border-0 bg-white shadow">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-semibold">
                  Это бесплатно?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 opacity-70">Сейчас да. Мы тестируем сервис и ищем первых пользователей.</p>
              </details>
            </Card>
            <Card className="p-4 border-0 bg-white shadow">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-semibold">
                  Что если собеседник мне не понравится?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 opacity-70">Вы всегда можете завершить чат. Но мы гарантируем, что к 36-му вопросу вы узнаете человека с неожиданной стороны.</p>
              </details>
            </Card>
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="py-16 bg-[#1E3A5F] text-[#F5F0E8]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Готовы попробовать?</h2>
          <p className="text-xl mb-8">Первые 100 пользователей получат доступ к расширенным настройкам поиска.</p>
          <Link href="/api/auth/vk">
            <Button size="lg" className="bg-[#F5F0E8] text-[#1E3A5F] hover:bg-[#F5F0E8]/90 text-lg px-8 py-6 rounded-xl">
              Начать знакомство
            </Button>
          </Link>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-8 border-t border-[#1E3A5F]/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-xl font-bold">36 вопросов</div>
          <div className="text-sm opacity-70">© 2026, 36 вопросов</div>
          <Link href="/privacy" className="text-sm hover:underline opacity-70">Политика конфиденциальности</Link>
        </div>
      </footer>
    </div>
  )
}