import { useEffect, useState } from 'react';

const Particle = ({ index }: { index: number }) => {
  const randomAngle = Math.random() * Math.PI * 2;
  const distance = 20 + Math.random() * 10;
  const duration = 0.5 + Math.random() * 0.3;
  const delay = index * 0.1;

  return (
    <div
      className="absolute w-1 h-1 bg-primary rounded-full opacity-0"
      style={{
        left: '50%',
        top: '50%',
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--tx': `${Math.cos(randomAngle) * distance}px`,
        '--ty': `${Math.sin(randomAngle) * distance}px`
      } as React.CSSProperties}
    />
  );
};

export const LogoParticles = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 2000); // Trigger particles every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <Particle key={`${key}-${i}`} index={i} />
      ))}
    </div>
  );
};