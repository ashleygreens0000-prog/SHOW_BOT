import type { Movie } from '../types';

interface Props {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: Props) {
  return (
    <div className="poster-card" onClick={() => onClick(movie)}>
      <img
        src={movie.poster_url}
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          const t = e.target as HTMLImageElement;
          t.src = `https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=400`;
        }}
      />
      {movie.type === 'series' && (
        <div className="series-badge">Series</div>
      )}
      <div className="poster-overlay">
        <span style={{
          fontFamily: "'Lora', serif",
          fontSize: 13,
          fontWeight: 500,
          color: '#f0ece4',
          lineHeight: 1.3,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)'
        }}>
          {movie.title}
        </span>
      </div>
    </div>
  );
}
