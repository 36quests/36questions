// hooks/useWebRTC.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCProps {
  roomId: string;
  userName: string;
  signalingUrl: string;
  turnConfig: {
    urls: string[];
    username: string;
    credential: string;
  };
}

export function useWebRTC({ roomId, userName, signalingUrl, turnConfig }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Получаем доступ к камере и микрофону
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Ошибка доступа к камере/микрофону:', err);
      }
    };
    initMedia();

    // Подключаемся к сигнальному серверу
    const s = io(signalingUrl);
    setSocket(s);

    s.emit('join-room', { roomId, userName });

    s.on('existing-users', (users) => {
      setParticipants(users);
    });

    s.on('user-joined', (user) => {
      setParticipants(prev => [...prev, user]);
    });

    s.on('user-left', (user) => {
      setParticipants(prev => prev.filter(p => p.id !== user.id));
    });

    // Очистка при размонтировании
    return () => {
      s.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, userName, signalingUrl]);

  return { localStream, remoteStreams, participants };
}