import { useState, useEffect, useRef } from 'react';
import type { Movie } from '../types';

interface Props {
  movies: Movie[];
  activeMovie?: Movie | null;
}

export default function DynamicBackground({ movies, activeMovie }: Props) {
  const [bgA, setBgA] = useState('');
  const [bgB, setBgB] = useState('');
  const [activeSlot, setActiveSlot] = useState<'a' | 'b'>('a');
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setBackground = (url: string) => {
    if (!url) return;
    if (activeSlot === 'a') {
      setBgB(url);
      setActiveSlot('b');
    } else {
      setBgA(url);
      setActiveSlot('a');
    }
  };

  useEffect(() => {
    if (activeMovie?.poster_url) {
      setBackground(activeMovie.poster_url);
      return;
    }
    if (movies.length === 0) return;
    const posters = movies.filter(m => m.poster_url).map(m => m.poster_url);
    if (posters.length === 0) return;

    setBgA(posters[0]);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % posters.length;
      setBackground(posters[indexRef.current]);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies, activeMovie]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <div
        className="bg-layer"
        style={{
          backgroundImage: bgA ? `url(${bgA})` : 'none',
          opacity: activeSlot === 'a' ? 1 : 0,
        }}
      />
      <div
        className="bg-layer"
        style={{
          backgroundImage: bgB ? `url(${bgB})` : 'none',
          opacity: activeSlot === 'b' ? 1 : 0,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.85) 100%)'
      }} />
    </div>
  );
}
