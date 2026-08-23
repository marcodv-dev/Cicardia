import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault(); // Blocca la navigazione immediata
    setActiveIndex(index);

    // Aspetta la durata della transizione CSS prima di cambiare pagina
    setTimeout(() => {
      navigate('/dashboard');
    }, 350);
  };

  return (
    <main className="page">
      {Array.from({ length: 20 }).map((_, index) => (
        <a
          key={index}
          href="/dashboard"
          onClick={(e) => handleClick(e, index)}
          className={`card shadow ${activeIndex === index ? 'active' : ''}`}
        >
          <span>Go to Dashboard</span>
          <span>{'>'}</span>
        </a>
      ))}
    </main>
  );
}