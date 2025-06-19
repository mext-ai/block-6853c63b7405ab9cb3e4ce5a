import React, { useEffect, useState, useRef } from 'react';

interface BlockProps {
  title?: string;
}

interface PianoKey {
  note: string;
  frequency: number;
  color: string;
  isBlack?: boolean;
  position: number;
}

const Block: React.FC<BlockProps> = ({ title = "Mini Piano for Kids" }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Piano keys configuration
  const whiteKeys: PianoKey[] = [
    { note: 'C', frequency: 261.63, color: '#FF6B6B', position: 0 },
    { note: 'D', frequency: 293.66, color: '#4ECDC4', position: 1 },
    { note: 'E', frequency: 329.63, color: '#45B7D1', position: 2 },
    { note: 'F', frequency: 349.23, color: '#96CEB4', position: 3 },
    { note: 'G', frequency: 392.00, color: '#FECA57', position: 4 },
    { note: 'A', frequency: 440.00, color: '#FF9FF3', position: 5 },
    { note: 'B', frequency: 493.88, color: '#A8E6CF', position: 6 },
    { note: 'C2', frequency: 523.25, color: '#FFB6C1', position: 7 }
  ];

  const blackKeys: PianoKey[] = [
    { note: 'C#', frequency: 277.18, color: '#2C3E50', position: 0.5, isBlack: true },
    { note: 'D#', frequency: 311.13, color: '#34495E', position: 1.5, isBlack: true },
    { note: 'F#', frequency: 369.99, color: '#2C3E50', position: 3.5, isBlack: true },
    { note: 'G#', frequency: 415.30, color: '#34495E', position: 4.5, isBlack: true },
    { note: 'A#', frequency: 466.16, color: '#2C3E50', position: 5.5, isBlack: true }
  ];

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContext.current && !hasInteracted) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      setHasInteracted(true);
      
      // Send completion event when first interaction happens
      window.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'mini-piano-kids', completed: true }, '*');
      window.parent.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'mini-piano-kids', completed: true }, '*');
    }
  };

  // Play sound function
  const playSound = (frequency: number, duration: number = 0.3) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  // Handle key press
  const handleKeyPress = (key: PianoKey) => {
    initAudioContext();
    
    setActiveKeys(prev => new Set(prev).add(key.note));
    playSound(key.frequency);

    // Remove active state after animation
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 200);
  };

  // Keyboard support
  useEffect(() => {
    const keyMap: { [key: string]: PianoKey } = {
      'q': whiteKeys[0], 'w': whiteKeys[1], 'e': whiteKeys[2], 'r': whiteKeys[3],
      't': whiteKeys[4], 'y': whiteKeys[5], 'u': whiteKeys[6], 'i': whiteKeys[7],
      '2': blackKeys[0], '3': blackKeys[1], '5': blackKeys[2], '6': blackKeys[3], '7': blackKeys[4]
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keyMap[event.key.toLowerCase()];
      if (key && !activeKeys.has(key.note)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKeys]);

  // Demo melody
  const playDemo = async () => {
    if (isPlaying) return;
    
    initAudioContext();
    setIsPlaying(true);

    const melody = [
      whiteKeys[0], whiteKeys[2], whiteKeys[4], whiteKeys[4],
      whiteKeys[3], whiteKeys[1], whiteKeys[0]
    ];

    for (let i = 0; i < melody.length; i++) {
      const key = melody[i];
      setActiveKeys(new Set([key.note]));
      playSound(key.frequency, 0.5);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveKeys(new Set());
      
      if (i < melody.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsPlaying(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Comic Sans MS, cursive',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          animation: 'bounce 2s infinite'
        }}>
          🎹 {title} 🎵
        </h1>
        <p style={{
          fontSize: '1.2rem',
          margin: '0',
          opacity: 0.9
        }}>
          Click the colorful keys or use your keyboard (Q-I, 2,3,5,6,7)!
        </p>
      </div>

      {/* Piano Container */}
      <div style={{
        position: 'relative',
        background: '#8B4513',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        border: '3px solid #654321'
      }}>
        {/* White Keys */}
        <div style={{
          display: 'flex',
          gap: '2px'
        }}>
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key)}
              style={{
                width: '60px',
                height: '200px',
                background: activeKeys.has(key.note) ? key.color : 'white',
                border: `3px solid ${key.color}`,
                borderRadius: '0 0 8px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: activeKeys.has(key.note) ? 'white' : key.color,
                transition: 'all 0.1s ease',
                transform: activeKeys.has(key.note) ? 'translateY(4px)' : 'translateY(0)',
                boxShadow: activeKeys.has(key.note) 
                  ? `0 2px 10px ${key.color}40` 
                  : '0 4px 8px rgba(0,0,0,0.2)',
                paddingBottom: '10px',
                outline: 'none',
                position: 'relative',
                zIndex: 1
              }}
            >
              {key.note}
            </button>
          ))}
        </div>

        {/* Black Keys */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex'
        }}>
          {blackKeys.map((key) => (
            <button
              key={key.note}
              onClick={() => handleKeyPress(key)}
              style={{
                position: 'absolute',
                left: `${key.position * 62 - 15}px`,
                width: '40px',
                height: '120px',
                background: activeKeys.has(key.note) ? '#FFD700' : key.color,
                border: 'none',
                borderRadius: '0 0 5px 5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: activeKeys.has(key.note) ? '#2C3E50' : '#FFD700',
                transition: 'all 0.1s ease',
                transform: activeKeys.has(key.note) ? 'translateY(3px)' : 'translateY(0)',
                boxShadow: activeKeys.has(key.note) 
                  ? '0 2px 8px rgba(255,215,0,0.5)' 
                  : '0 3px 6px rgba(0,0,0,0.4)',
                paddingBottom: '8px',
                outline: 'none',
                zIndex: 2
              }}
            >
              {key.note}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <button
          onClick={playDemo}
          disabled={isPlaying}
          style={{
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: isPlaying ? '#95a5a6' : 'linear-gradient(45deg, #ff6b6b, #feca57)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            transform: isPlaying ? 'scale(0.95)' : 'scale(1)',
            outline: 'none'
          }}
        >
          {isPlaying ? '🎵 Playing...' : '🎵 Play Demo Song'}
        </button>

        <div style={{
          color: 'white',
          fontSize: '1rem',
          textAlign: 'center',
          opacity: 0.8
        }}>
          <div>🎹 Click keys to play!</div>
          <div>🎵 Each key has its own color!</div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Block;