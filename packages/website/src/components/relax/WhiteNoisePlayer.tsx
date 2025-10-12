import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Clock } from 'lucide-react';
// import { createCSRTranslations } from '@/i18n/utils';

interface WhiteNoisePlayerProps {
  lang: string;
}

interface WhiteNoiseTrack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  audioUrl?: string; // For now, we'll generate white noise programmatically
}

const whiteNoiseTracks: WhiteNoiseTrack[] = [
  {
    id: 'rain',
    name: 'Rain',
    description: 'Gentle rain sounds for relaxation',
    icon: '🌧️',
    color: 'bg-blue-500',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Calming ocean waves',
    icon: '🌊',
    color: 'bg-cyan-500',
  },
  {
    id: 'forest',
    name: 'Forest Sounds',
    description: 'Birds and nature sounds',
    icon: '🌲',
    color: 'bg-green-500',
  },
  {
    id: 'thunder',
    name: 'Thunderstorm',
    description: 'Distant thunder and rain',
    icon: '⛈️',
    color: 'bg-purple-500',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    description: 'Cozy fireplace sounds',
    icon: '🔥',
    color: 'bg-orange-500',
  },
  {
    id: 'wind',
    name: 'Wind',
    description: 'Gentle wind through trees',
    icon: '🍃',
    color: 'bg-emerald-500',
  },
];

export default function WhiteNoisePlayer({ lang }: WhiteNoisePlayerProps) {
  const [selectedTrack, setSelectedTrack] = useState<WhiteNoiseTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timer, setTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // const t = createCSRTranslations(lang, 'relax');

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate white noise
  const generateWhiteNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const bufferSize = 4096;
    const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContextRef.current.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    whiteNoise.connect(gainNodeRef.current);

    return whiteNoise;
  };

  // Generate pink noise (more natural sounding)
  const generatePinkNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const bufferSize = 4096;
    const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const pinkNoise = audioContextRef.current.createBufferSource();
    pinkNoise.buffer = buffer;
    pinkNoise.loop = true;
    pinkNoise.connect(gainNodeRef.current);

    return pinkNoise;
  };

  const startAudio = () => {
    if (!selectedTrack || !audioContextRef.current || !gainNodeRef.current) return;

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop any existing audio
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    // Generate appropriate noise based on track
    let noiseSource;
    switch (selectedTrack.id) {
      case 'rain':
      case 'ocean':
        noiseSource = generatePinkNoise();
        break;
      default:
        noiseSource = generateWhiteNoise();
    }

    oscillatorRef.current = noiseSource as any;
    oscillatorRef.current.start();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleTrackSelect = (track: WhiteNoiseTrack) => {
    if (isPlaying) {
      stopAudio();
    }
    setSelectedTrack(track);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMuted ? 0 : volume;
    }
  };

  const startTimer = (minutes: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const seconds = minutes * 60;
    setTimeRemaining(seconds);
    setTimer(minutes);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          stopAudio();
          setTimer(null);
          setTimeRemaining(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(null);
    setTimeRemaining(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Track Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {whiteNoiseTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackSelect(track)}
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 ${
              selectedTrack?.id === track.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="card-body text-center p-4">
              <div className="text-4xl mb-2">{track.icon}</div>
              <h3 className="font-semibold text-lg">{track.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{track.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Player Controls */}
      {selectedTrack && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedTrack.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{selectedTrack.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{selectedTrack.description}</p>
            </div>

            {/* Main Controls */}
            <div className="flex justify-center items-center gap-6 mb-6">
              <button
                onClick={togglePlayPause}
                className={`btn btn-circle btn-lg ${
                  isPlaying ? 'btn-error' : 'btn-primary'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className={`btn btn-circle btn-outline ${
                  isMuted ? 'btn-error' : 'btn-ghost'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={stopAudio}
                className="btn btn-circle btn-outline"
                disabled={!isPlaying}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 mb-6">
              <Volume2 className="w-5 h-5" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="range range-primary flex-1"
              />
              <span className="text-sm font-mono w-12">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Timer */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Timer</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[15, 30, 60, 90].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => startTimer(minutes)}
                    className={`btn btn-sm ${
                      timer === minutes ? 'btn-primary' : 'btn-outline'
                    }`}
                    disabled={isPlaying && timer !== minutes}
                  >
                    {minutes}m
                  </button>
                ))}
                {timer && (
                  <button
                    onClick={stopTimer}
                    className="btn btn-sm btn-error"
                  >
                    Stop
                  </button>
                )}
              </div>
              
              {timeRemaining !== null && (
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-primary mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Time remaining
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">💡 Tips for Better Relaxation</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Use headphones for the best audio experience</li>
            <li>• Start with lower volume and adjust to your comfort</li>
            <li>• Try different sounds to find what works best for you</li>
            <li>• Use the timer to avoid falling asleep with audio playing</li>
            <li>• Combine with deep breathing for enhanced relaxation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
