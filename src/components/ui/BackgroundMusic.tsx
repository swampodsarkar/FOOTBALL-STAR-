import { useRef, useState, useEffect } from 'react';
import { HiMusicalNote, HiSpeakerXMark } from 'react-icons/hi2';

const VOLUME = 0.12;
const FADE_DURATION = 5000;

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/bc.mp3');
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const handleInteraction = () => {
      if (started) return;
      setStarted(true);
      audio.play().then(() => {
        const startTime = Date.now();
        const fadeIn = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / FADE_DURATION, 1);
          audio.volume = VOLUME * progress;
          if (progress < 1) requestAnimationFrame(fadeIn);
        };
        fadeIn();
      }).catch(() => {});
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [started]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (muted) {
      audioRef.current.volume = VOLUME;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.volume = 0;
    }
    setMuted(!muted);
  };

  return (
    <button
      onClick={toggle}
      title={muted ? 'Unmute music' : 'Mute music'}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all shadow-lg backdrop-blur-sm"
    >
      {muted ? (
        <HiSpeakerXMark className="w-5 h-5" />
      ) : (
        <HiMusicalNote className="w-5 h-5" />
      )}
    </button>
  );
}
