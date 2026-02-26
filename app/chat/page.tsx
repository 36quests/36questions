// app/chat/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'

// Компонент, который использует useSearchParams
function ChatContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId') || `room-${Date.now()}`
  const userName = searchParams.get('name') || 'User'

  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const { localStream, remoteStreams, participants } = useWebRTC({
    roomId,
    userName,
    signalingUrl: process.env.NEXT_PUBLIC_SIGNALING_URL || 'wss://ваш-сервер:3001',
    turnConfig: {
      urls: [`turn:${process.env.NEXT_PUBLIC_TURN_SERVER || 'ваш-сервер'}:443`],
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'webrtc',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || 'сильный_пароль_123'
    }
  })

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    remoteStreams.forEach((stream, peerId) => {
      const videoEl = remoteVideoRefs.current.get(peerId)
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
      }
    })
  }, [remoteStreams])

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const leaveCall = () => {
    window.location.href = '/find'
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Основное видео (сетка участников) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Свое видео */}
              <Card className="relative aspect-video bg-gray-900 overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {userName} (вы)
                </div>
              </Card>

              {/* Видео участников */}
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
                const participant = participants.find(p => p.id === peerId)
                return (
                  <Card key={peerId} className="relative aspect-video bg-gray-900 overflow-hidden">
                    <video
                      ref={el => {
                        if (el) remoteVideoRefs.current.set(peerId, el)
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                      {participant?.name || peerId.slice(0, 5)}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Панель управления */}
            <div className="mt-4 flex justify-center gap-4">
              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? 'default' : 'destructive'}
                className="rounded-full w-12 h-12"
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? 'default' : 'destructive'}
                className="rounded-full w-12 h-12"
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>
              <Button
                onClick={leaveCall}
                variant="destructive"
                className="rounded-full w-12 h-12"
              >
                <PhoneOff />
              </Button>
            </div>
          </div>

          {/* Сайдбар с вопросами */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] p-4 overflow-y-auto">
              <h3 className="font-serif text-xl mb-4">36 вопросов</h3>
              {/* Здесь будет компонент вопросов из предыдущей версии */}
              <div className="space-y-4">
                <p className="text-sm opacity-70">Вопрос 1 из 36</p>
                <p className="font-medium">
                  Если бы вы могли пригласить на ужин любого человека, кого бы вы выбрали?
                </p>
                <Button className="w-full mt-4">Следующий вопрос</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Главный экспорт с Suspense
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Загрузка чата...</div>}>
      <ChatContent />
    </Suspense>
  )
}